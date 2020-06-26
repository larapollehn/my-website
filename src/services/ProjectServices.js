const redisAccess = require('../data/RedisAccess');
const log = require('../log/Logger');
const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PROJECT_KEY = "project_data";
const CACHE_TTL = 60 * 60 * 24;
console.assert(GITHUB_TOKEN !== null && GITHUB_TOKEN !== undefined, 'GITHUB_TOKEN is not set');

const getProjects = (expressRequest, expressResponse) => {
    log.debug('Github pinned Repo Data is needed');
    redisAccess.get(PROJECT_KEY, function (err, reply) {
        log.debug('Redis Cache is checked for stored data')
        if (reply) {
            log.debug('Repo Data was found in Cache and is returned');
            expressResponse.send(JSON.parse(reply));
        } else {
            log.debug('Repo Data was NOT found in Cache and is now fetched from github APi with query')
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
                                  ... on RepositoryInfo {
                                    homepageUrl
                                  }
                                  ... on Repository {
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
            `
                }
            }).then((githubResponse) => {
                log.debug('Github responded with', githubResponse.data);
                redisAccess.setex(PROJECT_KEY, CACHE_TTL, JSON.stringify(githubResponse.data));
                expressResponse.status(200).send(githubResponse.data);
            }).catch((error) => {
                log.error('Could not fetch project data', error)
                expressResponse.status(500).send(error.message);
            })
        }
    })
}

module.exports = {
    getProjects
}