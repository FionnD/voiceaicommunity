import requests


def fetch_contributors_by_commits(owner, repo, include_anonymous=False):
    """
    Fetches contributors to the specified GitHub repository, sorted by the number of commits in descending order.

    Parameters:
    - owner (str): The username or organization that owns the repository.
    - repo (str): The name of the repository.
    - include_anonymous (bool): Whether to include anonymous contributors.

    Returns:
    - str: A comma-separated list of contributor usernames.
    """
    contributors = []
    page = 1
    per_page = 100  # Maximum allowed per GitHub API

    while True:
        url = f"https://api.github.com/repos/{owner}/{repo}/contributors"
        params = {"per_page": per_page, "page": page}
        if include_anonymous:
            params["anon"] = "true"
        response = requests.get(url, params=params)

        if response.status_code != 200:
            raise Exception(f"GitHub API error: {response.status_code} - {response.text}")

        data = response.json()
        if not data:
            break

        # Extract usernames
        for user in data:
            if "login" in user:
                contributors.append(user["login"])
            elif include_anonymous and "name" in user:
                contributors.append(user["name"])
        page += 1

    return ", ".join(contributors)


# Example usage:
if __name__ == "__main__":
    owner = "pipecat-ai"
    repo = "pipecat"
    usernames = fetch_contributors_by_commits(owner, repo)
    print(usernames)
