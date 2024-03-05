const { describe, it, after, beforeEach } = require('node:test')
const { deepEqual, ok } = require('node:assert')


const BASE_URL = `http://localhost:3000`
describe('Api Login', () => {
    let _globalToken = ''
    let _server = {}

    async function makeRequest(url, data) {
        const request = await fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                authorization: _globalToken
            }
        })

        deepEqual(request.status, 200)
        return request.json()
    }
    async function token() {
        const input = {
            user: 'felipe',
            password: '123'
        }
        const data = await makeRequest(`${BASE_URL}/login`, input)
        ok(data.token, 'O token deve estar presente')
        _globalToken = data.token
    }

    beforeEach(async () => await token())

    it('Cadastrar produto', () => {
      
            const data = {
                product: 'violao',
                price: '1234'
            }
            async function cadastrar(){
                const res = await makeRequest(`${BASE_URL}/product`, data)
                deepEqual(res.success, 'cadastro realizado com sucesso')
            }
            cadastrar()
                           
    })

    after(_server.close)
})



// it('Cadastrar produto', async () => {
      
//     const data = {
//         product: 'pasta de dente',
//         price: '1234'
//     }

//  const res = await fetch(`${BASE_URL}/product`, {
//     method: 'POST',
//     headers: {
//         authorization: _globalToken
//     },
//     body: JSON.stringify(data)
//  }).then(res => res)
//  deepEqual(res.status, 200)
                   
// })

// after(_server.close)
// })