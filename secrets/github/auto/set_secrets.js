const sodium = require('tweetsodium');
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
var util = require('util');

const username = "davidcarboni";
const owner = "notbinary";
const repo = "dtfs2"
const pat_path = "./pat.txt"
const csv_path = "./environment_variables.csv"

const { Octokit } = require("@octokit/rest");

// Processes a csv of the form:
//
// Key , all, Dev, Test, Prod
// KEY1,    , a  , b   , c
// KEY2, 0
//
// Into GH Secrets:
//
// DEV_KEY1=a
// TEST_KEY1=b
// PROD_KEY1=c
// KEY2=0

function getPersonalAccessToken() {

    console.log("Getting personal access token...")

    try {
        if (fs.existsSync(pat_path)) {
            return fs.readFileSync(pat_path, 'utf8').trim();
        } else {
            console.log(`Please put a Github Personal Access Token with 'repo' scope into a file called ${path}`)
        }
    } catch(err) {
        console.error(err)
    }
}

function encrypt(secretValue, key) {

    console.log("Encrypting secret value...")

    // Convert the message and key to Uint8Array's (Buffer implements that interface)
    const messageBytes = Buffer.from(secretValue);
    const keyBytes = Buffer.from(key, 'base64');
    
    // Encrypt using LibSodium.
    encryptedBytes = sodium.seal(messageBytes, keyBytes);
    encryptedB64 = Buffer.from(encryptedBytes).toString('base64');
    console.log(`${secretValue} -> ${encryptedB64}`)
    return encryptedB64
}

function processKey(row, secretsList) {
    secrets = {};
    const key = row["Key"];
    console.log(`Processing: ${key}`);
    console.log(`Environments:`)
    Object.keys(row).forEach((key) => {

        // For each environment where a value is specified, set the secret value:
        if (key !== "Key" && row[key]) {

            // Secret name
            var secretName
            if (key === "all") {
                secretName = `${row["Key"]}`
            } else {
                secretName = `${key.toUpperCase()}_${row["Key"]}`
            }
            console.log(` - ${key} -> ${secretName}`)
            removeItem(secretsList, secretName);

            // Encrypt secret value
            secretValue = row[key];
            secrets[secretName] = secretValue;
        }
    });
    return secrets;
}

function removeItem(array, item) {
    const index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array
}

async function getRepoPublicKey(octokit) {

    console.log("Getting repository public key...")

    const response = await octokit.actions.getRepoPublicKey({
        owner: owner,
        repo: repo,
    })

    if (response.status === 200) {
        return response.data;
    } else {
        console.log(response);
        throw("Error getting repo public key")
    }
}

async function listRepoSecrets(octokit) {

    console.log("Listing repository secrets...")

    const response = await octokit.actions.listRepoSecrets({
        owner: owner,
        repo: repo,
        per_page: 100,
    })

    if (response.status === 200) {

        // Check we've got all the secrets
        total_count = response.data.total_count
        if (total_count > 100) {
            throw("Too many secrets, need to paginate.")
        }

        // Collate secret names
        secrets = response.data.secrets;
        console.log(response.data)
        names = []
        secrets.forEach(function (secret) {
            names.push(secret.name);
          });
        return names;

    } else {
        console.log(response);
        throw("Error listing repo secrets")
    }
}

async function setSecret(name, value, publicKey, octokit) {

    console.log("Setting secret on Github...")

    const encrypted_value = encrypt(value, publicKey.key);
    //console.log({
    try {
        // Broken:
        // const response = await octokit.actions.createOrUpdateRepoSecret(
        //  - doesn't add the secret name to the end of the path
        const response = await octokit.request("PUT /repos/:owner/:repo/actions/secrets/:name", {
            owner,
            repo,
            name,
            encrypted_value,
            key_id: publicKey.key_id
        });

        if (response.status === 201 || response.status == 204) {
            return "";
        }

        // Looks like that didn't work.
        console.log(response);
        throw(`Error setting secret value: ${name}`)
        
    } catch (err) {
        console.log(util.inspect(err))
        return name;
    }
}

async function main() {

    // Get the repo public key
    const pat = getPersonalAccessToken();
    const octokit = new Octokit({auth: pat, userAgent: username});
    const publicKey = await getRepoPublicKey(octokit);
    
    // List the current secrets
    const secretsList = await listRepoSecrets(octokit);
    console.log(util.inspect(secretsList))

    // Parse the input csv
    var secrets = {}
    var failed_secrets = []
    fs.createReadStream(csv_path)
        .pipe(csv())
        .on('data', async (row) => {
            console.log(row);
            const newSecrets = await processKey(row, secretsList, publicKey);
            secrets = {
                ...secrets,
                ...newSecrets
            }
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            console.log(`Secrets not included in the csv (${secretsList.length}):\n ${secretsList}`);
            console.log(`Secrets: ${secrets}`)
    
            // Set the secrets, but delay each call so we don't hit the Github abuse detection mechanism
            delay = 2000;
            Object.keys(secrets).forEach((secretName) => {
                delay += 2000;
                setTimeout(async function() {
                    result = await setSecret(secretName, secrets[secretName], publicKey, octokit);
                    if (result) {
                        failed_secrets.push(secretName)
                    }
                }, delay);
            })
        });

}

main();