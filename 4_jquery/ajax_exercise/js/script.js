const username = 'JoAndrie';

$(document).ready(function() {
    fetchRepos();
    fetchJoAndrieCommits();
});

function fetchRepos() {
    let reposContainer = $('#repos');
    reposContainer.empty();

    let url = `https://api.github.com/users/${username}/repos`;

    $.ajax({
        url: url,
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`
        },
        success: function(repos) {
            let repoData = [];

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
    let detailsUrl = `https://api.github.com/repos/${repo.full_name}`;

    $.ajax({
        url: detailsUrl,
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`
        },
        success: function(details) {
            let detailsData = {
                commitsCount: 0,
                language: details.language,
                readmeUrl: details.html_url + '/blob/master/README.md'
            };

            let commitsUrl = `https://api.github.com/repos/${repo.full_name}/commits`;
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
    let contributorsUrl = `https://api.github.com/repos/${repo.full_name}/contributors`;

    $.ajax({
        url: contributorsUrl,
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`
        },
        success: function(contributors) {
            let contributorsData = contributors.map(contributor => ({
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
    let reposContainer = $('#repos');
    let template = $('#repo-template').html();
    let repoElement = $(template);

    repoElement.find('.repo-link').attr('href', repo.html_url).text(repo.name);
    repoElement.find('.repo-description').text(repo.description || 'No description available');
    repoElement.find('.repo-language').text(`Language: ${details.language || 'N/A'}`);
    repoElement.find('.repo-commit-count').text(`Latest Commit Count: ${details.commitsCount}`);
    repoElement.find('.repo-creation-date').text(`Creation Date: ${new Date(repo.created_at).toLocaleDateString()}`);
    repoElement.find('.repo-readme-link').attr('href', details.readmeUrl);

    let contributorsList = repoElement.find('.contributors-list');
    details.contributors.forEach(contributor => {
        let contributorItem = $('<li>');
        let contributorLink = $('<a>').attr('href', contributor.profileUrl).attr('target', '_blank').text(contributor.username);
        let contributorText = ` (${contributor.contributions} contributions)`;

        contributorItem.append(contributorLink).append(contributorText);
        contributorsList.append(contributorItem);
    });

    reposContainer.append(repoElement);
}

function fetchJoAndrieCommits() {
    let joAndrieCommitsContainer = $('#joAndrieCommits');
    joAndrieCommitsContainer.empty();

    let url = `https://api.github.com/users/${username}/events`;

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

            let commitEvents = events.filter(event => event.type === 'PushEvent' && event.actor.login === username);
            if (commitEvents.length === 0) {
                joAndrieCommitsContainer.html('<p>No commits found.</p>');
                return;
            }

            let commitCount = 0;
            commitEvents.forEach(event => {
                if (commitCount >= 5) return;
                let repoFullName = event.repo.name;
                let repoName = repoFullName.substring(repoFullName.indexOf('/') + 1);
                let commits = event.payload.commits || [];
                commits.forEach(commit => {
                    if (commitCount >= 10) return;

                    let commitElement = $('#commit-template').html();

                    let commitElementObj = $(commitElement);
                    commitElementObj.find('.commit-repo-name').text(repoName);
                    commitElementObj.find('.commit-message').text(commit.message);
                    commitElementObj.find('.commit-date').text(new Date(event.created_at).toLocaleString());
                    commitElementObj.find('.commit-contributor').text(event.actor.login);
                    commitElementObj.find('.commit-avatar').attr('src', event.actor.avatar_url);
                    commitElementObj.find('.commit-link').attr('href', commit.url);

                    joAndrieCommitsContainer.append(commitElementObj);

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

function updateChart(repoData) {
    let ctx = document.getElementById('chart').getContext('2d');
    let myChart = new Chart(ctx, {
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
