[![Build Status](https://travis-ci.com/larapollehn/my-website.svg?branch=master)](https://travis-ci.com/larapollehn/my-website)
# My Website

My private website which uses GitHub API to present all of my favorites projects. You can also leave me a message. 

## GitHub API

You can use the GitHub GraphQL API to retrieve your data. Playing around with the following query in the GraphQL API Explorer https://developer.github.com/v4/explorer/

```
query{
    repositoryOwner(login: "larapollehn") {
      ... on ProfileOwner {
        pinnedItemsRemaining
        itemShowcase {
          items(first: 6) {
            totalCount
            edges {
              node {
                ... on RepositoryInfo {
                  homepageUrl
                }
                ... on Repository {
                  openGraphImageUrl 
                  name
                  description
                  url
                  languages(first: 3) {
                    totalCount
                    edges {
                      node {
                        name
                      }
                    }
                  }
                  ... on RepositoryInfo {
                    homepageUrl
                  }
                }
              }
            }
          }
          hasPinnedItems
        }
      }
      avatarUrl
    }
  }
```

## CI/CD with Travis

I use Travis-CI to automate my deploying process. 

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
