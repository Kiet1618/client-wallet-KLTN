import { withAuth } from "next-auth/middleware"

// i used advanced middleware configuration
export default withAuth(
  function middleware(req) {
    // some actions here
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // verify token and return a boolean
        return true
      },
    },
  }
)

export const config = { matcher: ["/overview"] }