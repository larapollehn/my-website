const redisAccess = require('../data/RedisAccess');
const log = require('../log/Logger');
const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
console.assert(GITHUB_TOKEN !== null && GITHUB_TOKEN !== undefined, 'GITHUB_TOKEN is not set');

const getProjects = (expressRequest, expressResponse) => {

    axios({
        method: 'POST',
        url: 'https://api.github.com/graphql',
        headers: {
            "Authorization": `Bearer ${GITHUB_TOKEN}`
        },
        data: {
            query:
                `query{
                  repositoryOwner(login: "larapollehn") {
                    ... on ProfileOwner {
                      pinnedItemsRemaining
                      itemShowcase {
                        items(first: 5) {
                          totalCount
                          edges {
                            node {
                              ... on RepositoryInfo{
                                 homepageUrl}
                              ... on Repository {
                                id
                                openGraphImageUrl 
                                name
                                description
                                url
                                 languages(first:3) {
                                  totalCount
                                  edges {
                                    node {
                                      name
                                    }
                                  }
                                }
                                    ... on RepositoryInfo{
                                      homepageUrl
                                    }
                              }
                            }
                          }
                        }
                        hasPinnedItems
                      }
                    }
                  }
                }
            `
        }
    }).then((githubResponse) => {
        log.debug('Github responded with',githubResponse.data);
        expressResponse.status(200).send(githubResponse.data);
    }).catch((error) => {
        log.error('Could not fetch project data', error)
        expressResponse.status(500).send(error.message);
    })
}

function checkCache(request, response, next) {

}

module.exports = {
    getProjects
}