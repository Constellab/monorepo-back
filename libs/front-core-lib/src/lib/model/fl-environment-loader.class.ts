/**
 * Method to load the environment in the assets
 */
export function flLoadEnvironmentFromAssets(envPath: string): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', './' + envPath, true);
    xmlhttp.onload = () => {
      if (xmlhttp.status === 200) {
        resolve(JSON.parse(xmlhttp.responseText));
      } else {
        reject('Error during app initialization');
      }
    };
    xmlhttp.send();
  });
}
