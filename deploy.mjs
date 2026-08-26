import { execSync } from 'child_process';
import { createInterface } from 'readline';

const [host, appName, imageName, tagPrefix, versionArg] = process.argv.slice(2);

if (!host || !appName || !imageName || !tagPrefix) {
  console.error('Error: Missing required parameters');
  console.error('Usage: node deploy.mjs <host> <appName> <imageName> <tagPrefix> [imageVersion]');
  process.exit(1);
}

let imageVersion = versionArg;

if (!imageVersion) {
  console.log(`No version provided, checking for git tags starting with '${tagPrefix}'...`);
  try {
    const tags = execSync(`git tag --list "${tagPrefix}*" --sort=-creatordate`, { encoding: 'utf-8' }).trim();
    const latestTag = tags.split('\n')[0];
    if (latestTag) {
      imageVersion = latestTag.replace(tagPrefix, '');
      console.log(`Found latest tag: ${imageVersion}`);
    }
  } catch {
    /* ignore */
  }

  if (!imageVersion) {
    console.log(`No git tags found starting with '${tagPrefix}'`);
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    imageVersion = await new Promise((resolve) =>
      rl.question('Image version: ', (answer) => {
        rl.close();
        resolve(answer);
      })
    );
  }
}

execSync(`caprover deploy --host ${host} --appName ${appName} --imageName ${imageName}:${imageVersion}`, {
  stdio: 'inherit',
});
