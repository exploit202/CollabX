Creator Dashboard backend package.

Extract this ZIP directly into:
F:\CollabX\backend

Then register the route in src/app.js:

const creatorDashboardRouter =
  require('./modules/creator/routes/creatorDashboard.routes');

app.use('/api/creator/dashboard', creatorDashboardRouter);

Dashboard endpoint:
GET /api/creator/dashboard

Authentication:
HTTP-only JWT cookie using the existing protect middleware.

profileViews is returned as 0 because the current project does not
contain a real profile-view tracking model/counter.
