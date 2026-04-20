---
agent: 'agent'
tools: ['web/githubRepo', 'github', 'get_issue', 'get_issue_comments', 'get_me', 'list_issues']
description: 'List issues assigned to me in the current repository and recommend what to focus on next'
---

Use #githubRepo to get the current repository owner and name.

Then do this in order:

1. Use #get_me to determine the current authenticated GitHub username.
2. Use #list_issues to retrieve issues for the current repository.
3. If #list_issues supports filtering, filter by:
   - repository owner and name from #githubRepo
   - assignee = current user from #get_me
   - state = all
4. If #list_issues does not support filtering directly, list issues for the repository and filter them yourself.
5. Exclude pull requests from the results.
6. For each remaining issue assigned to the current user, capture:
   - issue number
   - title
   - state
   - created date
   - updated date
   - comment count
   - labels
   - URL
7. If comment count is missing or unclear, use #get_issue_comments to count comments for that issue.
8. Group results into:
   - Open issues
   - Closed issues
9. Recommend which issues to focus on first using this priority:
   - older open issues first
   - then open issues with more comments
   - then recently updated open issues
   - closed issues only as lower-priority reference items
10. If no assigned issues are found, say that explicitly.
11. If #get_me or #list_issues is unavailable or fails, say:
   - issue lookup is blocked in the current environment
   - no assigned issues can be listed reliably
   - do not guess or infer issue assignments

Output exactly in this format:

## Assigned Issues

### Open
- #<number> <title> — <state> — created <date> — updated <date> — <comment count> comments — <url>

### Closed
- #<number> <title> — <state> — created <date> — updated <date> — <comment count> comments — <url>

## Recommended Focus
1. #<number> <title> — <short reason based on age, comments, and status>
2. #<number> <title> — <short reason based on age, comments, and status>
3. #<number> <title> — <short reason based on age, comments, and status>

## Notes
- Repository: <owner>/<repo>
- Authenticated user: <username or unavailable>
- Retrieval method: #list_issues
- Limitations: <tool limitation or none>