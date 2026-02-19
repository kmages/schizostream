import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });
  
  const { data: user } = await octokit.users.getAuthenticated();
  console.log('Authenticated as:', user.login);
  
  const repoName = 'schizostream';
  let repoUrl = '';
  
  try {
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: 'SchizoStream - Mental Health Crisis Navigation Platform',
      private: false,
      auto_init: false
    });
    console.log('Created repository:', repo.html_url);
    repoUrl = repo.clone_url;
  } catch (err: any) {
    if (err.status === 422) {
      const { data: repo } = await octokit.repos.get({
        owner: user.login,
        repo: repoName
      });
      console.log('Repository already exists:', repo.html_url);
      repoUrl = repo.clone_url;
    } else {
      throw err;
    }
  }
  
  console.log('REPO_URL=' + repoUrl);
  console.log('USERNAME=' + user.login);
  console.log('TOKEN=' + accessToken);
}

main().catch(console.error);
