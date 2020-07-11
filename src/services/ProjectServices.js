const redisAccess = require('../data/RedisAccess');
const log = require('../log/Logger');

const axios = require('axios');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PROJECT_KEY = "project_data";
const CACHE_TTL = 60 * 60 * 24;
console.assert(GITHUB_TOKEN !== null && GITHUB_TOKEN !== undefined, 'GITHUB_TOKEN is not set');

const QUERY =
    `query{
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
            `;

/**
 * fetches the 6 pinned project on my github profile from the github api
 * if they are not already in the redis cache
 * @param expressRequest
 * @param expressResponse
 * @param next
 * @returns {Promise<*>}
 */
async function getProjectsFromRedis(expressRequest, expressResponse, next) {
    log.debug('Github pinned Repo Data is needed');
    try {
        const reply = await redisAccess.get(PROJECT_KEY);
        log.debug('Redis Cache is checked for stored data')
        log.debug('Repo Data was found in Cache and is returned');
        if (reply) {
            return expressResponse.send(JSON.parse(reply));
        } else {
            next();
        }
    } catch (e) {
        log.error('Repo Data was NOT found in Cache and could not be fetched from github APi with query');
        next();
    }
}

async function getProjectFromGitHub(expressResponse) {
    try {
        const githubResponse = await axios({
            method: 'POST',
            url: 'https://api.github.com/graphql',
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`
            },
            data: {
                query: QUERY
            }
        });
        log.debug('Github responded with', githubResponse.data);
        redisAccess.setex(PROJECT_KEY, CACHE_TTL, JSON.stringify(githubResponse.data));
        return expressResponse.status(200).send(githubResponse.data);
    } catch (e) {
        log.error('Could not get project data from github', e)
        return expressResponse.status(500).send(e.message);
    }
}

module.exports = {
    getProjectsFromRedis,
    getProjectFromGitHub
}
