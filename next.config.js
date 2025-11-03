module.exports = {
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: 'https://kopiopastat.org/api/images/:path*',
      },
    ]
  },
}
