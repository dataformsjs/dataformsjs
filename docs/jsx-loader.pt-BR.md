<h1 align="center">
    <img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/docs/jsx-loader.png" title="DataFormsJS JSX Loader">
</h1>

<p align="center">Um minúsculo (6.6 kB) e ultra rápido compilador baseado em navagador para JSX / React.</p>
<hr>

<table>
	<tbody>
		<tr align="center"><td colspan="2">
            🌐 &nbsp; 🌎 &nbsp; 🌏 &nbsp; 🌍
		</td></tr>
        <tr>
			<td><a href="https://github.com/dataformsjs/dataformsjs/blob/master/docs/jsx-loader.md">English</a>
		</tr>
    	<tr>
			<td><a href="https://github.com/dataformsjs/dataformsjs/blob/master/docs/jsx-loader.zh-CN.md">中文 (简体)</a>
		</tr>
	</tbody>
</table>

## O que é isso? 🎉

Um único arquivo JavaScript `jsxLoader.js` que compila / [transcompila](https://en.wikipedia.org/wiki/Source-to-source_compiler) JSX para JS para navegadores modernos e para navegadores antigos baixará e utilizará Polyfills e Babel Standalone.

**Source:** https://github.com/dataformsjs/dataformsjs/blob/master/js/react/jsxLoader.js

**Demo:** https://www.dataformsjs.com/examples/hello-world/pt-BR/react.htm

**Many Examples** https://awesome-web-react.js.org/

## Por quê ❓

O script `jsxLoader.js` foi criado para fornecer um método rápido para incluir React com JSX em página web e apps web sem processo de compilação, ferramentas CLI, ou grandes dependências necessárias; simplesmente utilize React com JSX em uma webpage ou site e inclua os CDN ou arquivos JavaScript necessários.

Ferramentas de Desenvolvimento CLI como `webpack`, `babel` e `create-react-app` são ótimas, mas elas não fazem sentido para todos os sites, páginas web e fluxos de desenvolvimento; e o `Babel Standalone` é gigante para ser incluído em cada página - 320 kB em gzipp e 1.5 MB de JavaScript para o Navegador processar. Com opções baseadas em um navegador para JSX você pode **facilmente incluir componentes React em qualquer página** sem ter que compilar todo o site utilizando React ou JSX.

As of 2024 over 99% of the global population views webpages with modern browsers so the 6.6 kb `jsxLoader.js` will compile and load JSX code on webpages for all modern browsers; for the smaller percentage of the population that views websites on a legacy browser (IE 11 on Windows Server, old iOS, and old Android) `jsxLoader.js` will automatically download Babel Standalone and use it to correctly compile and load JSX code. `jsxLoader.js` provides a good trade-off - fast for most users with modern browsers and it still works on old browsers.

Antes do `jsxLoader.js` ser criado todos os demos React no DataFormsJS utilizavam Babel Standalone. Babel Standalone é ótimo para prototipars e funciona com React DevTools, entretanto, devido ao seu tamanho ele ocupa muita memória e causa um atraso inicial ao carregar a página, então, é geralmente evitado em site em produção. Em dispositivos móveis o atraso pode ser vários segundos. Aqui está um exemplo de diferença de desempenho antes e depois utilizando `Babel` vs `jsxLoader`.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Rreact-speed-and-memory-with-babel.png" alt="React com Babel">

O desempenhoé ótimo porque o jsxLoader compila o código para JS e navegadores modernos e por ser um compilador mínimo é muito rápido para processar.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/React-speed-and-memory-with-jsxLoader.png" alt="React com jsxLoader">

## Isso pode ser utilizado em apps e sites em produção? 🚀

**Sim**, isso criado por esta razão.

O script é testado com uma variedade de dispositivos e navegadores incluindo os seguintes:

* Navegadores Modernos:
  * Chrome
  * Safari - Desktop e iOS (iPhone/iPad)
  * Firefox
  * Edge (Chromium e EdgeHTML)
  * Samsung Internet
  * UC Browser
  * Opera
* Navegdores Legados:
  * IE 11
  * Safari iOS

Além do React, ele também funciona e está testado com a biblioteca alternativa à React, Preact.

O script `jsxLoader.js` é muito pequeno para baixar (6.6 kB - min e em gzip) e compila código muito rapidamente (geralmente em milisegundos para cada script JSX).

## Como utilizar? 🌟

```html
<!-- Inclua o React na página -->
<script src="https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js" crossorigin="anonymous"></script>

<!--
    Inclua o DataFormsJS JSX Loader.
    Pode utilizar [jsxLoader.min.js] ou [jsxLoader.js].
-->
<script src="https://cdn.jsdelivr.net/npm/dataformsjs@5/js/react/jsxLoader.min.js"></script>

<!--
    Inclua componentes e scripts JSX utilizando [type="text/babel"].
    Este é o mesmo método que seria utilizado com Babel Standalone.
-->
<script type="text/babel" src="https://cdn.jsdelivr.net/npm/dataformsjs@5/js/react/es6/JsonData.js"></script>
<script type="text/babel" src="app.jsx"></script>
<script type="text/babel">

    class HelloMessage extends React.Component {
        render() {
            return (
                <div>Olá {this.props.name}</div>
            );
        }
    }

    ReactDOM.render(
        <HelloMessage name="Mundo" />,
        document.getElementById('root')
    );

</script>

<!--
    If a script uses `import` or requires other features on available with
    JavaScript Modules you can specify [data-type="module"] so that the compiled
    script will be added to the page as <script type="module">.

    [data-type="module"] is also supported by Babel Standalone.

    When using jsxLoader you cannot import JSX files directly as you would
    do so from a local build process with Vite, Create-React-App, etc.
    `import` would only work for regular JavaScript files. To see how to
    dynamically import JSX search this page for `<LazyLoad>`.
-->
<script type="text/babel" data-type="module">
    import { object } from './library/file.js'
</script>
```

## Demos 🌐

### React <img src="https://raw.githubusercontent.com/dataformsjs/website/master/public/img/logos/react.svg" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/pt-BR/react.htm
* https://www.dataformsjs.com/examples/places-demo-react.htm
* https://www.dataformsjs.com/examples/image-classification-react.htm
* https://www.dataformsjs.com/examples/image-gallery-react.htm
* https://www.dataformsjs.com/examples/log-table-react.htm
* https://www.dataformsjs.com/examples/countries-no-spa-react.htm
* https://www.dataformsjs.com/examples/countries-no-spa-graphql.htm
* https://www.dataformsjs.com/examples/hacker-news-react.htm
* https://www.dataformsjs.com/examples/web-components-with-react.htm
* https://www.dataformsjs.com/getting-started/en/template-react.htm
* https://www.dataformsjs.com/getting-started/en/template-react-graphql.htm
* https://dataformsjs.com/examples/code-playground-react.htm
* https://awesome-web-react.js.org/

### Preact <img src="https://raw.githubusercontent.com/dataformsjs/website/master/public/img/logos/preact.svg" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/pt-BR/preact.htm
* https://www.dataformsjs.com/examples/places-demo-preact.htm
* https://www.dataformsjs.com/examples/countries-no-spa-preact.htm
* https://www.dataformsjs.com/examples/image-gallery-preact.htm
* https://www.dataformsjs.com/examples/web-components-with-preact.htm
* https://www.dataformsjs.com/getting-started/en/template-preact.htm
* https://www.dataformsjs.com/getting-started/en/template-preact-router.htm
* https://www.dataformsjs.com/getting-started/en/template-preact-graphql.htm

### Vue 3 <img src="https://raw.githubusercontent.com/dataformsjs/website/master/public/img/logos/vue.svg" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/en/vue3-with-jsx.htm
* https://www.dataformsjs.com/examples/vue3-dynamic-jsx.htm

### Rax <img src="https://raw.githubusercontent.com/dataformsjs/website/master/public/img/logos/rax.png" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/pt-BR/rax.htm

### Node <img src="https://nodejs.org/static/images/favicons/favicon.png" width="32" height="32">
* https://github.com/dataformsjs/dataformsjs/blob/master/scripts/jsx-loader-node-demo.js


## Teste-o online no Code Playground 🚀

* https://dataformsjs.com/pt-BR/playground _Main site playground uses CodeMirror_
* https://dataformsjs.com/examples/code-playground-react.htm _Demo built with React using Monaco Editor from VS code_

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Playground-React.png" alt="Code Playground do React">

## Funcionará para todos os sites e apps? 💫

O script é destinado para lidar com a maioria, mas não toda sintaxse JSX. Um objetivo geral é que a maioria de JSX deve funcionar com uma trivial atualização, se necessária, em casos extremos.

Assim que essse script foi criado todas as demonstrações de React para o DataFormsJS puderam utilizá-lo ao invés do Babel sem ter que fazer qualquer mudança no código JSX e isso é o esperado para a maioria dos sites.

### Manipulando instruções de requisição e importação do node

Pelo JSX ser convertido diretamente para JS para o navegador, código que utiliza instruções `require` e `import` para o node não funcionará no navegador. Contudo, o script `jsxLoader.js` proporciona uma API flexível que pode ser utilizada para persolalizar o código gerado, para que as intruções `import` e `require` ou outro códigopossar ser manipulado pelo navegador.

Por exemplo, se você utilizar o seguinte em seu código JSX:

```js
import { useState } from 'react';
```

Então você tem várias opções:

1) Remova-o e utilize `React.useState` ao invés de `useState` em seu código. Isso funciona porque `React` é uma variável flobal para o navegador.

```javaScript
const [count, setCount] = React.useState(0);
```

2) Manually define the function to link to the global object in the JSX code.

```javascript
const useState = React.useState;
```

3) Adicione um find e replace personalizado.

```html
<script>
    jsxLoader.jsUpdates.push({
        find: /import { useState } from 'react';/g,
        replace: 'var useState = React.useState;'
    });
</script>
```

Freqüentemente componente, funções etc que necessitam ser importadas pelo node existirão como variáveis globais no navegador, então para desenvolvimento JSX baseado em navegador você pode freqüentemente exluir instruções `import` e `require`.

Por padrão, o seguinte import é automaticamente tratado:

```javascript
import React from 'react';
export function ...
export default class ...
```

Related to node `import` and `export` are the browser `exports` object and `require(module)` function which are required by many React Libraries when linking to the library directly. In many cases this can be handled by simply calling `jsxLoader.addBabelPolyfills();` before loading the library from a `<script>` tag on the page.

In some cases a library will load a module from `require(name)` where the name doesn't match `window.name`. For example the popular node library `classnames` links to `window.classNames`. To handle this add a property to `jsxLoader.globalNamespaces` for mapping prior to calling `jsxLoader.addBabelPolyfills();`.

```javascript
jsxLoader.globalNamespaces.classnames = 'classNames';
jsxLoader.addBabelPolyfills();
```

**Example usage of `jsxLoader.addBabelPolyfills()`:**
* https://awesome-web-react.js.org/examples/ui/react-toastify.htm
* https://awesome-web-react.js.org/examples/state-management/react-recoil.htm

### Utilizando JavaScript que somente tem suporte de navegador parcial

Outra questão é ao utilizar JavaScript que somente funcina em alguns navegadores modernos. Por exemplo utilizando campos / propriedades de Classe funcionará em alguns navegadores (Chrome, Firefox), mas não funcionará com outros navegadores (à partir de 2020 isso inclui Safari, Edge (EdgeHTML) e Samsung Internet).

```jsx
class App extends React.Component {
    // Esta versão funciona com Chrome e Firefox,
    // mas causará erros com muitos dispositivos
    // móveis
    state = {
        message: 'Olá Mundo',
    };

    componentDidMount() {
        window.setTimeout(() => {
            this.setState({
                message: 'Atualizado por Timer'
            });
        }, 500);
    }

    render() {
        return (
            <div>{this.state.message}</div>
        )
    }
}
```

```jsx
class App extends React.Component {
    // Ao definir propriedades de class no `constructor()`
    // o código funcionará em todos os navegadores modernos.
    constructor(props) {
        super(props);
        this.state = {
            message: 'Olá Mundo',
        };
    }
}
```

## Divisão de Código ✂️

Um component separado DataFormsJS React `<LazyLoad>` existe e permite que apps baseadas em navegadores carreguem dinamicamente scripts `*.js`, `*.css` e `*.jsx` na primeira vez que eles são utilizados por um componenete.

Exemplo da App Demonstração Lugares:
* https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-react.htm
* https://github.com/dataformsjs/dataformsjs/blob/master/examples/html/search-places-react.jsx

Source code for `<LazyLoad>`
* https://github.com/dataformsjs/dataformsjs/blob/master/js/react/es6/LazyLoad.js

No exemplo abaixo todos os 3 arquivos serão baixados quando o Componente `LoadMapAndPage` for montado. Enquanto os scripts estão sendo carregados, um Componenet `<ShowLoading>` será exibido e uma vez que todos downloads de scripts forem finalizados, então o Componenet `<ShowCity>` será dinamicamente criado. Neste exemplo um valor de string é utilizado por `ShowCity` porque o Componente não existirá até o arquivo `place-react.jsx` ser baixado.

Além disso as propriedades adicionadas `data` e `params` serão passadas como acessórios para `ShowCity`; quaisquer propriedades utilizadas serão passadas para o elemento filho. Se `ShowCity` já existir antes de chamar `<LazyLoad>` então `isLoaded={<isLoaded />}` poderia ser utilizada.

```jsx
function LoadMapAndPage(props) {
    return (
        <LazyLoad
            scripts={[
                'https://cdn.jsdelivr.net/npm/leaflet@1.5.1/dist/leaflet.css',
                'https://cdn.jsdelivr.net/npm/leaflet@1.5.1/dist/leaflet.js',
                './html/place-react.jsx',
            ]}
            isLoading={<ShowLoading />}
            isLoaded="ShowCity"
            data={props.data}
            params={props.params} />
    );
}
```

Por padrão todos `scripts` são baixados de forma assíncrona sem aguardar por scripts anteriores completarem. Esta opção é a mais rápida, entretanto, ela não funcionará para todos os códigos. No exemplo abaixo `chosen.jquery.min.js` deve ser carregado após `jquery-3.4.1.min.js` para que a propriedade `loadScriptsInOrder` seja utilizada para comunicar a `LazyLoad` para carregar os scripts em ordem seqüencial.

Além disso o trecho abaixo mostra que `{children}` pode ser utilizado ao invés da propriedade `isLoaded`.

```jsx
<LazyLoad
    isLoading={<ShowLoading />}
    loadScriptsInOrder={true}
    scripts={[
        'https://code.jquery.com/jquery-3.4.1.min.js',
        'https://cdn.jsdelivr.net/npm/chosen-js@1.8.7/chosen.css',
        'https://cdn.jsdelivr.net/npm/chosen-js@1.8.7/chosen.jquery.min.js',
        'css/countries-chosen.css',
    ]}>
    {children}
</LazyLoad>
```

In general using `<LazyLoad>` is recommended when all JSX is linked from multiple external files and one file depends on another.

```html
<!--
    For example if [data-page.jsx] first requires [app.jsx] to be loaded
    using this might cause an error on some page loads if [app.jsx] is
    downloaded and compiled before [data-page.jsx].
 -->
<script type="text/babel" src="data-page.jsx"></script>
<script type="text/babel" src="app.jsx"></script>

<!--
    One solution would be to embed the [app.jsx] file in the main HTML page
    because embedded code is compiled after all downloaded scripts.
-->
<script type="text/babel" src="data-page.jsx"></script>
<script type="text/babel">
    function App() {
        return <DataPage />
    }

    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
</script>

<!--
    The other solution is to use <LazyLoad> from [app.jsx].
    This example is from the DataFormsJS Playground.
-->
<script type="text/babel">
    function LazyLoadDataPage(props) {
        return (
            <LazyLoad
                scripts="data-react.jsx"
                isLoading={<ShowLoading />}
                isLoaded="ShowCountries"
                data={props.data}
                params={props.params} />
        );
    }
</script>
```

## Debugging 🐛

Since jsxLoader is browser based debugging is handled with your Browser's built-in DevTools. Two methods are recommended.

### Debug the Compiled Code

Add a `debugger;` line in the code. If DevTools is open, then it will stop on the code just like if a breakpoint were manually set and if DevTools is now open then there will be no effect.

This will allow you to debug the compiled JavaScript rather than the original JSX Code. When using this method the code will appear in a JavaScript Virtual Machine "VM" file and you will likely not be able to select it from the file list.

```js
if (condition) {
    debugger;
}
```

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/docs/jsx-debug-1-debugger.png" alt="Debug using debugger statement">

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/docs/jsx-debug-2-devtools.png" alt="Debug jsxLoader with DevTools">


### Debug JSX

You can debug the JSX directly in DevTools by forcing jsxLoader to use Babel Standalone configured with source maps. Because source maps are used the file name will appear in DevTools.

IMPORTANT - if using this option make sure to comment out or remove the settings after, otherwise your page would be downloading full Babel Standalone in production.

```js
jsxLoader.isSupportedBrowser = false;
jsxLoader.sourceMaps = true;
```

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/docs/jsx-debug-3-sourcemaps.png" alt="Debug with Babel Standalone">

## Uso Avançado e Interno 🔬

Você pode [visualizar o código aqui](https://github.com/dataformsjs/dataformsjs/blob/master/js/react/jsxLoader.js)! Todo código é um arquivo único e inclui muito comentários úteis para permitir melhor entendimento de como isso funciona.

O script jsxLoader fornece um número de propriedades e funções que podem ser utilizados para personalizar como isso roda. Abaixo estão os usos mais comuns.

```js
// Visualizar velocidade do compilador para cada script no console DevTools
jsxLoader.logCompileTime = true;

// Visualizar o código gerado para cada script no console DevTools
jsxLoader.logCompileDetails = true;

// Chama isto se Preact estiver sendo utilizada ao invés de React. Além disso se
// seu app Preact tiver erros inesperados ao utilizar isto, você pode facilmente
// copiar, modificar e utilizar uma versão personalizada da função para que isso
// funcione com a sua app.
jsxLoader.usePreact();

// Adicione um arquivo personalizado e substitua lógica para o seu app ou site.
jsxLoader.jsUpdates.push({
    find: /import { useState } from 'react';/g,
    replace: 'var useState = React.useState;'
});

// Propriedades e opções adicionais existem e pode ser visualizadas no código
// fonte do arquivo [jsxLoader.js].
```

### jsxLoader.logCompileTime

Ao utilizar `jsxLoader.logCompileTime` o tempo que isso leva para compilar cada script será registrado no console DevTools.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-loader-log-compile-time.png" alt="Registrar Tempo de Compilação no Console DevTools">

### jsxLoader.logCompileDetails

Ao utilizar `jsxLoader.logCompileDetails` passo detalhados e completos do compilador principal serão registrados no console DevTools. Isso inclui:

* Tokens gerados por Análise Léxica
* Árvore de Sintaxe Abstrata  (Abstract Syntax Tree - AST) gerada à partir dos Tokens
* Código Gerado à partir da AST

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-loader-log-compile-details.png" alt="Registrar Detalhes de Compilação no Console DevTools">

### Como Código JS é adicionado a página

O script `jsxLoader.js` roda no evento de Documento `DOMContentLoaded` e primeiramente verifica o ambiente para determinar se polyfills são necessários e se Babel deve ser utilizado. Ele, então, baixa o Código JSX (ou lê código JSX inline), compila-o para JavaScript normal e adiciona-o de volta à página como JavaScript no elemento `<head>`.

Scripts adicionados na página terão um atributo `data-compiler` com o valor `jsxLoader` ou `Babel` para indicar qual compilador foi adicionado. Se o script foi baixado, então, será incluído o atribuito `data-src` como a URL do script JSX original.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-added-to-page-as-js.png" alt="Código JSX compilado para JavaScript">

### Desenvolvimento Local

Tipicamente, a versão minimizada `jsxLoader.min.js` será utilizada para produção enquanto a versão completa do script `jsxLoader.js` será utilizada para desenvolvimento. Não tem dependências e é baseado em navegador, então, assim que é incluído em uma página você pode percorrer pelo código utilizando as DevTools do navegador.

### Gerando [jsxLoader.min.js] à partir do [jsxLoader.js]

Todos os arquivos `*.min.js` no DataFormsJS são gerados à partir de versões completas dos arquivos de mesmo nome utililizando um script de geração que depende de `uglify-js`, `terser` e `Babel`. O `jsxLoader.min.js` pode ser gerado utilizando somente `uglify-js`.

```bash
# Da raiz do projeto
node install
node run build
```

Ou rode o script [.\scripts\build.js](https://github.com/dataformsjs/dataformsjs/blob/master/scripts/build.js) diretamente: `node build.js`.

### Teste de Unidade

Testes de Unidade para `jsxLoader.js` rodam à partir de um navegador utilizando Mocha. Frequentemente, Componenetes React são testados de um pseudo ambiente de navegador utilizando Jest, entretando, é importante que o `jsxLoader.js` seja testado em um navegador verdadeiro para que possa ser verificado em quantos ambientes forem possíveis e porque isso baixa Polyfills e Babel para alguns navegadroes.

Este método também auxilia a verificar se o comportamento do códico JS compilado do `jsxLoader.js` corresponde ao mesmo resultado do Babel. Por exemplo, navegadores modernos precisam ser confirmados assimcomo o IE 11 (que utiliza o Babel).

```bash
# Instale o Node
# https://nodejs.org

# Baixe o repositório [dataformsjs/dataformsjs]:
# https://github.com/dataformsjs/dataformsjs

# Inicie um Servidor à partir da raiz do projeto.
# O teste local e o servidor de demonstração para o DataFormsJS não tèm
# dependências fora dos objeto integrados ao Node.js.
node ./test/server.js

# Ou rode o arquivo diretamente
cd test
node server.js

# Verja o site de teste de unidade e rode os testes:
# http://127.0.0.1:4000/
```

Ou tente Testes de unidade diretamente no servidor web principal:

https://www.dataformsjs.com/unit-testing/

A imagem abaixo mostra como a página de Teste de Unidade é. Ao testar com um navegador moderno `jsxLoader` aparecerá no canto superior esquerdo da tela.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-testing-modern-browser.png" alt="Teste de Unit com Navegadores Modernos">

Ao testar um browser legado como o IE 11, `Babel` será mostrado juntamente com `(Polyfill Downloaded)`.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-testing-ie-11.png" alt="Teste de Unidade com o IE 11">

## Problemas Conhecidos ⚠️

* Em geral, se um problema conhecido requer muito código, ele provavelmente não será suportado porque este script pretende ser um pequeno e rápido parser/compilador JSX e não um parser/compilador completo de JavaScript.
* Mensgens de erro podem não ser muito amigáveis para alguns erros de sintaxes inesperados, então, utilizando linting em um Editor de Código é recomendado durante o desenvolvimento para evitar erros do `jsxLoader.js`. Se você desenvolve com o Visual Studio Code ou outro editor popular, isso ocorrerá automaticamente. Se você tiver erros de sitaxe com o código gerado e não for claro porque, então, utilizar as DevTools do Chrome é recomendado (ou Edge compilado à partir do Chromium). Porque JavaScript gerado é adicionado de volta em elementos dinâmicos, a maioria dos Navegadores mostrarão a localização errado do erro, mas as versões mais recentes do Chrome e Edge mostrarão freqüentemente no local correto.
    <img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-debug-error-in-chrome.png" alt="Depurar Erros com as Dev Tools do Chrome">
* Algumas vezes espaço em branco filho é gerado nos nós filhos de `React.createElement('element', props, ...children)` comparado ao que seria craido ao utilizar Babel. Geralmente isso não acontece com freqüencia, mas isso foi encontrado no [pagina demonstração de registro](https://www.dataformsjs.com/examples/log-table-react.htm). Este problema não possui efeito visual na página, não causa queda de desempenho e não acontece com freqüencia, então é considerado aceitável.
*  Texto que se parece com elementos dentro literais de um modelo aninhado complexo (strings modelo), pode causar erro de parsing ou resultados inesperados:

    Exemplo analisado(parsed) corretamente:
    ```JavaScript
    const testHtmlString = `${`'<div>test</div>'`}`
    ```
    Resultado: `testHtmlString = "'<div>test</div>'"`

    Exemplo de erro de análise (parsing error):
    ```JavaScript
    const testHtmlString = `${`<div>test</div>`}`
    ```
    Resultado: `testHtmlString = 'React.createElement("div", null, "test")';`
