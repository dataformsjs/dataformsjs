<p align="center">
	<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/logo/DataFormsJS-144px.png">
</p>

# :star2: Bem vindo ao DataFormsJS!

**Obrigado pela visita!** 🌠👍

DataFormsJS é um novo framework JavaScript e app autônomo de React e Web Components. Sendo pequeno, fácil de aprender, projetado para desenvolvimento rápido o DataFormsJS proporcionando uma grande experiência para desenvolvedores e usuários finais. Mesmo sendo novo (publicado em novembro de 2019), o DataFormsJS foi escrito e usado por muitos anos e tem um sólido nível de estabilidade com um grande número de testes de unidade.

Este repositório contém o framework DataFormsJS, páginas exemplo e testes de unidade. O site principal (/website) está em outro repositório.

## :dizzy: Por que utilizar o DataFormsJS?

|<img src="https://www.dataformsjs.com/img/icons/fast.svg" alt="Desenvolvimento Rápido" width="60">|<img src="https://www.dataformsjs.com/img/icons/small-size.svg" alt="Pequeno em Tamanho" width="60">|<img src="https://www.dataformsjs.com/img/icons/light-switch.svg" alt="Fácil de Aprender" width="60">|
|---|---|---|
|**Desenvolvimento Rápido** Mostre dados dos Web Services e GraphQL usando marcação HTML e define as características do App e Site utilizando atributos HTML.|**Tamanho Pequeno** Todos os arquivo são pequenos e baixados somente quando usados permitindo melhor desempenho e um site menor.|**Fácil de Aprender** O DataFormsJS é desenvolvido em torno de HTML, CSS, JavaScript, Modelos e tem uma API minima de JavaScript and HTML para que você possa iniciar imediatamente.|

|<img src="https://www.dataformsjs.com/img/icons/column.svg" alt="Estabilidade" width="60">|<img src="https://www.dataformsjs.com/img/icons/water.svg" alt="Flexibilidade" width="60">|<img src="https://www.dataformsjs.com/img/icons/star.svg" alt="Sites Melhores" width="60">|
|---|---|---|
|**Estabilidade** Desenvolvido para uso de longo prazo; um site desenvolvido com DataFormsJS hoje funcionará e será de fácil manutenção por décadas.|**Flexibilidade** Funciona bem com outros códigos e a API é desenvolvida para flexibilidade e características personalizadas. Se você consegue imaginar, você consegue desenvolvê-lo com o DataFormsJS.|**Sites Melhores** O DataFormsJS é desenvolvido para ser uma grande experiência para desenvolvedores e usuários finais permitindo que você crie sites melhores.|

|Funciona com|<img src="https://www.dataformsjs.com/img/logos/react.svg" alt="React" width="64"><div>React</div>|<img src="https://www.dataformsjs.com/img/logos/vue.svg" alt="Vue" width="64"><div>Vue</div>|<img src="https://www.dataformsjs.com/img/logos/handlebars.png" alt="Handlebars" width="64"><div>Handlebars</div>|<img src="https://www.dataformsjs.com/img/logos/graphql.svg" alt="GraphQL" width="64"><div>GraphQL</div>|e mais!|
|---|---|---|---|---|---|

|Aprenda uma coisa nova!|<div><img src="https://www.dataformsjs.com/img/icons/web-components.svg" alt="Web Components" width="64"></div><div>Web Components</div>|
|---|---|

## :rocket: Começando

**Começar a utilizar o DataFormsJS é extremamente fácil.**

Instale-o utilizando **npm**, esta opção funciona muito bem se você está usando `create-react-app` ou quer uma cópia local de todos os arquivos:
```
npm install dataformsjs
```

**Baixe este Repositório**. É pequeno para fazer o download, porque este repositório não possui dependências e carrega o HandlebarsJS, Vue e React de uma CDN. Para visualizar as páginas de exemplo, o Node precisa estar instalado e você pode iniciar o servidor local usando:
```
npm start
```

Os arquivos JavaScript para o Framework e o React e os Componentes da Web independentes existem no diretório `js`. Estrutura completa do diretório:

```
dataformsjs
├── docs
├── examples
│   ├── *.htm
│   └── server.js
└── js
│   ├── DataFormsJS.js
│   ├── react\*.js
│   ├── web-components\*.js
│   └── *\*.js
├── scripts\*.js
├── server\app.js
└── test
    ├── *.htm
    └── server.js
```

**Desenvolva online** usando o Code Playground: https://www.dataformsjs.com/#/en/playground

<p align="center">
<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Playground.png" alt="Code Playground" width="800">
</p>

**Baixe um arquivo modelo** usando scripts de um CDN: https://www.dataformsjs.com/#/en/getting-started

<p align="center">
<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Getting-Started-Templates.png" alt="Começando com Modelos" width="800">
</p>

## :page_facing_up: Código Exemplo

Este exemplo usa Vue para modelos. Se você salvar isso com um editor de texto poderá visualizá-lo localmente em seu navegador. Além disso o site principal contém muitos modelos e exemplos.

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>Exemplo do DataFormsJS usando Vue</title>
    </head>
    <body>
        <header>
            <nav>
                <a href="#/">Início</a>
                <a href="#/data">Dados de Exemplo</a>
            </nav>
        </header>

        <main id="view"></main>

        <template data-route="/">
            <h1>Olá Mundo!</h1>
        </template>

        <template id="loading-screen">
            <h3>Carregando...</h3>
        </template>

        <script
            type="text/x-template"
            data-engine="vue"
            data-route="/data"
            data-page="jsonData"
            data-url="https://www.dataformsjs.com/data/geonames/countries"
            data-load-only-once="true"
            data-lazy-load="jsonData, flags"
            data-countries>

            <h3 v-if="isLoading" v-cloak class="loading">Carregando...</h3>
            <h3 v-if="hasError" v-cloak class="error">{{ errorMessage }}</h3>
            <div v-if="isLoaded" v-cloak>
                <h1>Países</h1>
                <ul>
                    <li v-for="country in countries">
                        <i v-bind:class="country.iso.toLowerCase() + ' flag'"></i>
                        <span>{{ country.country }}<span>
                    </li>
                </ul>
            </div>
        </script>

        <script src="https://cdn.jsdelivr.net/npm/vue"></script>
        <script src="https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/DataFormsJS.min.js"></script>
        <script>
            app.lazyLoad = {
                jsonData: 'https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/pages/jsonData.min.js',
                flags: 'https://cdn.jsdelivr.net/npm/semantic-ui-flag@2.4.0/flag.min.css',
            };
            app.settings.lazyTemplateSelector = '#loading-screen';
        </script>
    </body>
</html>
```

Este exemplo utiliza React com o script `jsxLoader.min.js` para converter JSX para JS diretamente no navegador e isto inclui o DataFormsJS React Components do `DataFormsJS.min.js`. Se você copiar o conteúdo deste código, isso funcionará também em um navegador.

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>DataFormsJS Exemplo utilizando React</title>
    </head>
    <body>
        <div id="root"></div>

        <script type="text/babel">
            function ShowLoading() {
                return <div className="loading">Carregando...</div>;
            }

            function ShowError(props) {
                return <div className="error">{props.error}</div>;
            }

            function ShowCountries(props) {
                return (
                    <React.Fragment>
                        <h1>Países</h1>
                        <ul>
                            {props.data && props.data.countries && props.data.countries.map(country => {
                                return (
                                    <li key={country.iso}>{country.country}</li>
                                )
                            })}
                        </ul>
                    </React.Fragment>
                )
            }

            class App extends React.Component {
                render() {
                    return (
                        <ErrorBoundary>
                            <JsonData
                                url="https://www.dataformsjs.com/data/geonames/countries"
                                isLoading={<ShowLoading />}
                                hasError={<ShowError />}
                                isLoaded={<ShowCountries />}
                                loadOnlyOnce={true} />
                        </ErrorBoundary>
                    )
                }
            }

            ReactDOM.render(
                <App />,
                document.getElementById('root')
            );
        </script>

        <script src="https://unpkg.com/react@16.13.1/umd/react.production.min.js" crossorigin="anonymous"></script>
        <script src="https://unpkg.com/react-dom@16.13.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/react/es5/DataFormsJS.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dataformsjs@latest/js/react/jsxLoader.min.js"></script>
    </body>
</html>
```

## :handshake: Contributing

**Toda contribuição é bem vinda.** Para grandes mudanças incluindo mudanças significativas em código existente ou atualizando gráficos e arquivos, por favor abra primeiro um pedido para discutir o que gostaria que fosse modificado. Alguns exemplos de itens para contribuir:

* Erros de digitação e erros de Gramática - Se vir algum por favor conserte-o e envie-o.
* Documentação e Tutoriais. Atualmente a maior parte da documentação está na seção Referência Rápida e comentários de código então bastante documentação será escrita com o tempo.
* Futuramente muito mais exemplos serão desenvolvidos. Se você tem ideias, por favor envie-as.
* Testes de unidade adicionais e metodologias de teste - Arquivos do núcleo do framework e funcionalidades são testadas através de testes de unidade no entanto cada linha de código deveria ser testada dessa forma em todos os arquivos. Atualmente não exitem testes de unidade para Vue, React e Web Components.
* Scripts adicionais, componentes React, Web Components e funcionalidades.
* Novas Ideias - Se você tem ideias de como melhorar por favor abra uma questão para que possamos discutir.

O arquivo [docs/to-do-list.txt](https://github.com/dataformsjs/dataformsjs/blob/master/docs/to-do-list.txt) contém a lista complete de itens que estão atualmente pendentes e é um bom ponto para começar.

## :question: FAQ

**Por que o DataFormsJS foi criado?**
O desenvolvimento e uso do inicial  do DataFormsJS ocorreu de forma privada em 2013 para permitir um desenvolvimento rápido de alta qualidade e Aplicativos de Página Única livres de erros (SPA). O DataFormsJS foi desenvolvido para ser pequeno, ótimo desempenho e para proporcionar um processo de desenvolvimento muito mais rápido que os outros frameworks. Alguns dos motivos para o desenvolvimento rápido inclui mostrar serviços JSON usando somente marcação e modelos (Handlebars, Underscore etc.) e definindo as características de App e Site usando atributos HTML e pequenos plugins JavaScript.

Versões anteriores do DataFormsJS foram utilizadas em algumas empresas vários tipos diferentes de apps.

Agora que React e Vue são muito populares, componentes individuais para React foram desenvolvidos para ajudar como desenvolvimento React e o framework foi expandido para suportar Vue. Além disso Web Components individuais foram desenvolvidos para permitir funcionalidade similar em navegadores modernos sem o uso de um framework JavaScript.

**Por que levou tanto tempo para lançá-lo?**

O autor do DataFormsJS tinha vários trabalhos que o deixavam muito ocupado na época e também estava trabalhando em outro grande projeto ao mesmo tempo o [FastSitePHP](https://www.fastsitephp.com/en/).

**Qual o tamanho do DataFormsJS?**

_Todos os tamanhos são baseados nas versões minificadas dos scripts e compressão gzip dos servidores web._

* **O Framework DataFormsJS – 10.1 KB** (120 KB da versão completa e descompactada)
* Arquivos adicionais (controllers, plugins, etc) são tipicamente de 1 a 3 KB cada.
* Em geral ao usar o framework espere algo em torno de 15 KB para o carregamento da página inicial e daí vários KB para páginas adicionais que carregam plugins extras, páginas, controllers etc.

* **React JSX Loader – 5.1 KB** (120 KB da versão completa e descompactada)
* **React (Todos so componentes em JavaScript) – 7 KB**
* Components React individuais estão entre 3 e 12 KB ao descompactar e incluindo componentes.
* Web Components são tipicamente em torno de 1 a 3 KB cada, você usará um conjunto de componentes então nos apps de exemplo isso adiciona em torno de 15 KB para cada app.

Enquanto o framework DataFormsJS for pequeno ele será geralmente utilizado com mecanismos de Modelos ou de Visualização:

* React: ~ 40 KB
* Handlebars: ~ 22 KB
* Vue: ~ 33 KB
* Underscore: ~ 6 KB
* Nunjucks - ~ 25 KB

Além disso em um site maior ou mais complexo, é esperado que código de terceiros aumentem a quantidade de JavaScript. Por exemplo o editor de texto CodeMirror usado no site Code Playground tem em torno 250 KB de tamanho, no entanto o DataFormsJS tem a habilidade de baixar somente código de terceiros quando for necessário.

**Como eu utilizo o JSX Loader para React?**

Veja o documento principal: https://github.com/dataformsjs/dataformsjs/blob/master/docs/jsx-loader.pt-BR.md

**Quais são os planos futuros para o DataFormsJS?**

O DataFormsJS está aqui para is here para um longo uso e será desenvolvido indefinidamente com novas funcionalidades, componentes, exemplos, documentações etc. Mesmo o DataFormsJS sendo um framework ele também inclui componentes web autônomos os quais podem ser utilizados sem o framework. Com o tempo plugins adicionais para o framework e componentes web serão desenvolvidos.

O DataFormsJS continuará a ser desenvolvido de forma que seja possível desenvolvimento web (por exemplo: o site Code Playground) e seu pequeno tamanho será mantido além de somente carregar scripts quando necessário.

## :memo: Licença

Este projeto está sob o licenciamento **MIT** - veja a [LICENÇA](LICENSE) para detalhes.
