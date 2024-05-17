const username = 'JoAndrie';

$(document).ready(function() {
    fetchRepos();
    fetchJoAndrieCommits();
});

function fetchRepos() {
    const reposContainer = $('#repos');
    reposContainer.empty();

    const url = `https://api.github.com/users/${username}/repos`;

    $.ajax({
        url: url,
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`
        },
        success: function(repos) {
            const repoData = [];

            repos.forEach(repo => {
                fetchRepoDetails(repo, function(details) {
                    repoData.push({ 
                        name: repo.name, 
                        commits: details.commitsCount,
                        stars: details.stargazersCount,
                        forks: details.forksCount,
                        language: details.language,
                        readmeUrl: details.readmeUrl,
                        contributors: details.contributors
                    });

                    displayRepoAndCommit(repo, details);
                    
                    if (repoData.length === repos.length) {
                        updateChart(repoData);
                    }
                });
            });
            console.log(repos);
        },
        error: function(xhr, status, error) {
            reposContainer.html(`<p>Error fetching repositories: ${error}</p>`);
        }
    });
}

function fetchRepoDetails(repo, callback) {
    const detailsUrl = `https://api.github.com/repos/${repo.full_name}`;

    $.ajax({
        url: detailsUrl,
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`
        },
        success: function(details) {
            const detailsData = {
                commitsCount: 0,
                language: details.language,
                readmeUrl: details.html_url + '/blob/master/README.md'
            };

            const commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits`;
            $.ajax({
                url: commitsUrl,
                method: 'GET',
                headers: {
                    'Authorization': `token ${token}`
                },
                success: function(commits) {
                    detailsData.commitsCount = commits.length;
                    fetchContributors(repo, function(contributors) {
                        detailsData.contributors = contributors;
                        callback(detailsData);
                        console.log(commits);
                    });
                },
                error: function(xhr, status, error) {
                    console.error('Error fetching commits:', error);
                    callback(detailsData);
                }
            });
        },
        error: function(xhr, status, error) {
            console.error('Error fetching repository details:', error);
        }
    });
}


function fetchContributors(repo, callback) {
    const contributorsUrl = `https://api.github.com/repos/${repo.full_name}/contributors`;

    $.ajax({
        url: contributorsUrl,
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`
        },
        success: function(contributors) {
            const contributorsData = contributors.map(contributor => ({
                username: contributor.login,
                contributions: contributor.contributions,
                profileUrl: contributor.html_url
            }));
            callback(contributorsData);
            console.log(contributors);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching contributors:', error);
            callback([]);
        }
    });
}

function displayRepoAndCommit(repo, details) {
    const reposContainer = $('#repos');

    const repoElement = $(`
        <div class="repo">
            <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
            <p>${repo.description || 'No description available'}</p>
            <p>Language: ${details.language || 'N/A'}</p>
            <p>Latest Commit Count: ${details.commitsCount}</p>
            <p>Creation Date: ${new Date(repo.created_at).toLocaleDateString()}</p>
            <p><a href="${details.readmeUrl}" target="_blank">README</a></p>
            <h4>Contributors:</h4>
            <ul>
                ${details.contributors.map(contributor => `
                    <li>
                        <a href="${contributor.profileUrl}" target="_blank">${contributor.username}</a>
                        (${contributor.contributions} contributions)
                    </li>
                `).join('')}
            </ul>
        </div>
    `);

    reposContainer.append(repoElement);
}

function updateChart(repoData) {
    const ctx = document.getElementById('chart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: repoData.map(repo => repo.name),
            datasets: [{
                label: 'Commits',
                data: repoData.map(repo => repo.commits),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function fetchJoAndrieCommits() {
    const joAndrieCommitsContainer = $('#joAndrieCommits');
    joAndrieCommitsContainer.empty();

    const url = `https://api.github.com/users/${username}/events`;

    $.ajax({
        url: url,
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`
        },
        success: function(events) {
            if (!events || events.length === 0) {
                joAndrieCommitsContainer.html('<p>No commit events found.</p>');
                return;
            }

            const commitEvents = events.filter(event => event.type === 'PushEvent' && event.actor.login === username);
            if (commitEvents.length === 0) {
                joAndrieCommitsContainer.html('<p>No commits found.</p>');
                return;
            }

            let commitCount = 0;
            commitEvents.forEach(event => {
                if (commitCount >= 5) return;
                const repoFullName = event.repo.name;
                const repoName = repoFullName.substring(repoFullName.indexOf('/') + 1);
                const commits = event.payload.commits || [];
                commits.forEach(commit => {
                    if (commitCount >= 10) return;

                    const commitElement = $(`
                        <div class="commit">
                            <p><strong>Repository:</strong> ${repoName}</p>
                            <p><strong>Message:</strong> ${commit.message}</p>
                            <p><strong>Date:</strong> ${new Date(event.created_at).toLocaleString()}</p>
                            <p><strong>Contributor:</strong> ${event.actor.login}</p>
                            <img src="${event.actor.avatar_url}" alt="Profile Picture" width="50" height="50">
                            <p><strong>Link:</strong> <a href="${commit.url}" target="_blank">View Commit</a></p>
                        </div>
                    `);
                    joAndrieCommitsContainer.append(commitElement);

                    commitCount++;
                });
            });
            console.log(commitEvents);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching commits:', error);
            joAndrieCommitsContainer.html('<p>Error fetching commits. Please try again later.</p>');
        }
    });
}


