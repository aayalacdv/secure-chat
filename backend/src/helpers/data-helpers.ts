import { RSA_DATA } from "../data/rsa-data";





export const getRSAPublicKey = (userName : string) => {

    RSA_DATA.forEach((data) => {
        if(data.userName == userName) {
            return data.publicKey
        }
    })

}



export const serializeBigIntPayload = (payload : any) => {
    return JSON.stringify(payload , (key, value) =>
    typeof value === 'bigint'
        ? value.toString()+'n'
        : value // return everything else unchanged
    );
}



export const deserializeBigIntPayload = ( payload : any) => {
    return JSON.parse(payload , (key, value) => {
        if (typeof value === "string" && /^\d+n$/.test(value)) {
          return BigInt(value.substr(0, value.length - 1));
        }
        return value;
      });

}




