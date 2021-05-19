#!/usr/bin/env bash

resource_group=Digital-Dev
environments=(dev demo)
app_service_plan=dev

function delete-private-endpoint {
  echo Deleting private endpoint $1
  az network private-endpoint delete --name $1 -g $resource_group  
  echo Deleted private endpoint $1
}

function delete-application-gateway {
  echo Deleting Application Gateway $1
  az network application-gateway delete --name $1 -g $resource_group
  echo Deleted Application Gateway $1
}

function delete-subnet {
  echo Deleting subnet $1
  az network vnet subnet delete --name $1 -g $resource_group --vnet-name tfs-${app_service_plan}-vnet
  echo Deleted subnet $1
}

for environment in "${environments[@]}"
do
  # Delete private endpoint subnet
  delete-private-endpoint tfs-${environment}-mongo
  delete-private-endpoint tfs${environment}storage
  delete-private-endpoint tfs-${environment}-reference-data-proxy
  delete-private-endpoint tfs-${environment}-dtfs-central-api
  delete-private-endpoint tfs-${environment}-portal-api
  delete-private-endpoint tfs-${environment}-trade-finance-manager-api
  delete-private-endpoint tfs-${environment}-portal-ui
  delete-private-endpoint tfs-${environment}-trade-finance-manager-ui 
  delete-private-endpoint tfs-${environment}-gef-ui

  delete-application-gateway tfs-${environment}-gw
  delete-application-gateway tfs-${environment}-tfm-gw

  delete-subnet ${environment}-private-endpoints
  delete-subnet ${environment}-gateway
done

echo "Removing NICs"
nics=($(az network nic list -g $resource_group --query [].id -o tsv))
az network nic delete --ids $nics

delete-subnet ${resource_group}-vm
delete-subnet ${app_service_plan}-app-service-plan-egress