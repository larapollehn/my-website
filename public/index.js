function sendMail() {
    const token = grecaptcha.getResponse();
    const sendername = document.getElementById('senderName').value || 'unknown';
    const sendermail = document.getElementById('senderMail').value || 'unknown';
    const subject = document.getElementById('subject').value || ' ';
    const message = document.getElementById('message').value || ' ';

    axios({
        method: 'POST',
        url: '/api/v1/contact',
        data: {
            'token': token,
            'sendername': sendername,
            'sendermail': sendermail,
            'subject': subject,
            'message': message
        }
    }).then((response) => {
        console.log('Verification is a success', response.data);
    }).catch((error) => {
        console.log('Verification NOT a success', error.response);
    })
}

function getProjectData() {
    axios.get('/api/v1/projects')
        .then((response) => {
            displayAvatarIcon(response.data);
            displayProjects(response.data);
        }).catch((error) => {
        console.log('Error while fetching project data', error);
    });
}

getProjectData();

function displayAvatarIcon(projectData) {
    let avatarUrl = projectData['data']['repositoryOwner']['avatarUrl'];
    let iconImage = document.getElementById('avatarIcon');
    iconImage.setAttribute('src', avatarUrl);
}

function displayProjects(projectData) {
    let projectContainer = document.getElementById('portfolio');
    let projects = projectData['data']['repositoryOwner']['itemShowcase']['items']['edges'];
    projects.forEach(project => {
        let name = project['node']['name'];
        let description = project['node']['description'];
        let imageUrl = project['node']['openGraphImageUrl'];
        let repoUrl = project['node']['url'];
        let homepageUrl = project['node']['homepageUrl']
        let language_one = project['node']['languages']['edges'][0]['node']['name'];
        let language_two = project['node']['languages']['edges'][1]['node']['name'];
        let language_three = project['node']['languages']['edges'][2]['node']['name'];

        let projectDiv = document.createElement('div');
        projectDiv.classList.add('row');
        projectDiv.classList.add('no-gutters');
        projectDiv.classList.add('projectRow');

        projectDiv.innerHTML = `
                <div class="col-md-6 projectImageDiv">
                    <img class="projectImage" src="${imageUrl}" alt="projectImage">
                </div>
                <div class="col-md-6 projectText paddingRightCol">
                    <p class="projectTitle">${capitalizeName(name)}</p>
                    <p class="projectDescription">${description}</p>
                    <p class="projectLanguages">#${language_one} #${language_two} #${language_three}</p>
                    <div><a href="${repoUrl}" target="_blank" class="projectLink">Code</a> <a href="${homepageUrl}" target="_blank" class="projectLink">Demo</a></div>
                </div>   
           `;

        projectContainer.appendChild(projectDiv);
    });
}

function capitalizeName(name) {
    let words = name.split('-');
    let capitalizedWords = [];
    for(let i = 0; i <words.length; i++){
        capitalizedWords.push(`${words[i][0].toUpperCase()}${words[i].substring(1)}`)
    }
    return capitalizedWords.join(' ');
}
