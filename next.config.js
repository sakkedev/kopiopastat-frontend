module.exports = {
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: 'http://127.0.0.1:8080/images/:path*',
      },
    ]
  },
}
