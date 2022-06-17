import { generateRSAKeys } from '../../frontend/src/rsaUtils/basic-RSA';


export function genData() {
  console.log('Alice')

  const aliceKys =  generateRSAKeys().then((k : any) => console.log(k) )

  console.log('Bob')
  const bobKeys = generateRSAKeys().then((k:any) => console.log(k))
  
  console.log('Cameron')
  const cameronKeys = generateRSAKeys().then((k:any) => console.log(k))

}
  