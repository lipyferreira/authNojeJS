const jsonwebtoken = require('jsonwebtoken')
const http = require('http');
const { once } = require('events');
const { readFileSync, writeFileSync } = require('node:fs');

const DEFAULT_HEADER = { 'Content-Type': 'application/json' }

const VALID = {
    user: 'felipe',
    password: '123'
}
TOKEN_KEY = 'abc123'

async function loginRoute(request, response) {

    const { user, password } = JSON.parse(await once(request, "data"))
    if (user !== VALID.user || password !== VALID.password) {
        response.writeHead(400, DEFAULT_HEADER)
        response.end(JSON.stringify({ error: 'user/password invalid!' }))
    }

    const token = jsonwebtoken.sign({ user, message: 'oficina' }, TOKEN_KEY, { expiresIn: '1d' })

    response.end(JSON.stringify({ token }))
}


function validateHeaders(headers) {
    try {
        const auth = headers.authorization.replace(/bearer\s/ig, '')
        jsonwebtoken.verify(auth, TOKEN_KEY)
        return true
    } catch (error) {
        return false
    }
}

async function product(request, response) {

    const { product, price } = JSON.parse(await once(request, "data"))

    if (!product || !price) {
        response.writeHead(400, DEFAULT_HEADER)
        response.write(JSON.stringify({ error: 'Dados Invalidos' }))
        response.end()
        return;
    }

    let data = [{ product, price }]
    const db = readFileSync('db/db.json').toString()

        const dbJSON = JSON.parse(db)
        const dbUpdated = dbJSON.concat(...data)

        writeFileSync('db/db.json', JSON.stringify(dbUpdated))


        response.writeHead(200, DEFAULT_HEADER)
        response.write(JSON.stringify({ success: 'cadastro realizado com sucesso' }))
        response.end()
}

async function defaultRoute(request, response) {
    response.writeHead(404, DEFAULT_HEADER)
    response.end('Rota Invalida')
}


const handlerError = response => {
    return error => {
        console.error('Houve um Erro!**', error)
        response.writeHead(500, DEFAULT_HEADER)
        response.write(JSON.stringify({ error: 'Internal Server Error!!' }))

        response.end()
    }
}


async function handler(request, response) {

    if (request.url === '/login' && request.method === 'POST') {
        return loginRoute(request, response).catch(handlerError(response))

    }

    if (!validateHeaders(request.headers)) {
        response.writeHead(400, DEFAULT_HEADER)
        return response.end('Invalid token')
    }

    if (request.url === '/product' && request.method === 'POST') {
        return product(request, response).catch(handlerError(response))
    }

    return defaultRoute(request, response)
}

const api = http.createServer(handler)
    .listen(3000, () => console.log('listening to 3000'))

exports = { api }