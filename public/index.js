function sendMail() {
    const token = grecaptcha.getResponse();
    const sendername = 'Jane Doe';
    const sendermail = 'jane@doe.de';
    const subject = 'test mail';
    const message = 'Hello this is a test mail to test the mail service';

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
            displayProjects(response.data);
        }).catch((error) => {
        console.log('Error while fetching project data', error);
    });
}

getProjectData();

function displayProjects(projectData) {
    let projectContainer = document.getElementById('portfolio');
    let projects = projectData['data']['repositoryOwner']['itemShowcase']['items']['edges'];
    console.log(projects[2]);
    projects.forEach(project => {
        let name = project['node']['name'];
        let description = project['node']['description'];
        let imageUrl = project['node']['openGraphImageUrl'];
        let repoUrl = project['node']['url'];
        let homepageUrl = project['node']['homepageUrl']
        let language_one = project['node']['languages']['edges'][0]['node']['name'];
        let language_two = project['node']['languages']['edges'][1]['node']['name'];
        let language_three = project['node']['languages']['edges'][1]['node']['name'];

        let projectDiv = document.createElement('div');
        projectDiv.classList.add('row');

        projectDiv.innerHTML = `
           <div class="col-md-7">
                    <img class="projectImage" src="${imageUrl}" alt="projectImage">
                </div>
                <div class="col-md-5">
                    <p>${name}</p>
                    <p>${description}</p>
                    <p>#${language_one} #${language_two} #${language_three}</p>
                    <a href="${repoUrl}" target="_blank">Code</a> <a href="${homepageUrl}" target="_blank">Demo</a>
                </div>
           `;

        projectContainer.appendChild(projectDiv);
    });
}