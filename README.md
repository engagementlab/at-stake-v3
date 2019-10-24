# @Stake

[![Zenhub Badge](https://dxssrr2j0sq4w.cloudfront.net/3.2.0/img/external/zenhub-badge.png)](https://zenhub.com)

@Stake is a game that fosters democracy, empathy, and creative problem solving for civic issues. Players take on a variety of roles and pitch ideas under a time pressure, competing to produce the best idea in the eyes of the table's "Decider."

This is a digital version of the [tabletop game](https://elab.emerson.edu/projects/participation-and-engagement/atstake/) designed by the [Engagement Lab](http://elab.emerson.edu/) at Emerson College.

## v4.0

@Stake v4.0 is a substantial rewrite of the 2016 codebase using React.js and Next.js.

## Development

**NB:** This process will drastically change in the near future.

1. Install [el-web-sdk](https://github.com/engagementgamelab/el-web-sdk) and follow all dev-related installation docs.
2. If you intend on making changes and committing, **please [fork this repo](https://help.github.com/articles/fork-a-repo/)** and make pull requests here as need. Otherwise, you may simply clone if you simply want to run the code.
3. Link this module to el-web-sdk as per [the docs](https://gist.github.com/johnnycrich/07a64494ca051ea20caa8c82d83928e1).
4. You will also need to clone and `npm link` [learning-games-core](https://github.com/engagementgamelab/learning-games-core) as a package of the at-stake module.

5. Start the module. **From el-web-sdk**, run:

  ```
  grunt --sites=at-stake
  ```
The site should now be running at http://localhost:3000.
