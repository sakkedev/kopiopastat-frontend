module.exports = {
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: process.env.NODE_ENV === 'development' ? 'http://localhost:8080/images/:path*' : 'http://127.0.0.1:8080/images/:path*',
      },
    ]
  },
}
