const { MongoClient } = require('mongodb')
let dbConnection
let uri = 'mongodb+srv://Mohib_14:Mariokart8!@cluster0.mu9hzr6.mongodb.net/?retryWrites=true&w=majority'
module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect(uri)
            .then((client) => {
                dbConnection = client.db()
                return cb()
            })
            .catch(err => {
                console.log(err)
                return cb(err)
            })
    },
    getDb: () => dbConnection
}