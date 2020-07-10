# My Website

My private website which uses GitHub API to present all of my favorites projects. You can also leave me a message. 

## CI/CD

First time:
- Install Ruby and Gem on your local computer: `sudo apt install ruby ruby-dev -y`
- Install Travis CLI: `sudo gem install travis`
- Login: `travis login --pro`

For every other project
- Generate SSH key for deploying purpose: `ssh-keygen -t rsa -b 4096 -f deploy_rsa`
- Add public key to deploy server: `ssh-copy-id -i deploy_rsa.pub user@host.domain`
- Encrypt private key and upload the encryption password to travis' server: `travis encrypt-file deploy_rsa`
- Delete public and private key. Keep the encrypted private key.
- Configure `.travis.yml`
