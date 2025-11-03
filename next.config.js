module.exports = {
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: process.env.NODE_ENV === 'development' ? 'http://localhost:8080/images/:path*' : 'https://kopiopastat.org/api/images/:path*',
      },
    ]
  },
}
