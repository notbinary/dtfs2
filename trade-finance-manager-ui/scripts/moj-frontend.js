import MOJFrontend from '@ministryofjustice/frontend';

// Need to bring in jquery for MOJFrontend.MultiFileUpload
import jquery from 'jquery';

window.$ = jquery;

MOJFrontend.initAll();

// eslint-disable-next-line import/prefer-default-export
export { MOJFrontend };
