import {camelCase} from 'change-case'
import {writeFileSync} from 'fs'
import path from 'path'
import {generateApi} from 'swagger-typescript-api'

// const swaggerBase = `https://api.met.no/weatherapi`
const swaggerBase = `https://ws.geonorge.no`

const swaggers = ['stedsnavn/v1/sted']

export const generateTypes = async () => {
  let imports = ``
  let exports = ``
  const folder = `${path.resolve(__dirname, './__generated__')}`

  for (const swagger of swaggers) {
    const url = `${swaggerBase}/${swagger}/swagger`

    const name = `${swagger.replace(/\.|\//, '-')}`

    await generateApi({
      name: `${name}.ts`,
      output: folder,
      url,
      httpClientType: 'fetch',
    })

    const importedAs = camelCase(swagger.replace(/\-\d.\d/, ''))

    imports += `import {Api as ${importedAs}} from './${name}'\n`
    exports += `export const ${importedAs}Api = new ${importedAs}()\n`
  }

  writeFileSync(`${folder}/index.ts`, `// GENERATED\n${imports}\n${exports}`)
}

if (require.main === module) {
  generateTypes()
    .then(() => console.log('Swagger types generated for Meterologisk Institutt'))
    .catch((e) => console.error(e))
}
