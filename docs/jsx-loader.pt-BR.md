<h1 align="center">
    <img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/docs/jsx-loader.png" title="DataFormsJS JSX Loader">
</h1>

<p align="center">Um minúsculo (5.2 kB) e ultra rápido compilador baseado em navagador para JSX / React.</p>
<hr>

## O que é isso? :tada:

Um único arquivo JavaScript `jsxLoader.js` que compila / [transcompila](https://en.wikipedia.org/wiki/Source-to-source_compiler) JSX para JS para navegadores modernos e para navegadores antigos baixará e utilizará Polyfills e Babel Standalone.

**Source:** https://github.com/dataformsjs/dataformsjs/blob/master/js/react/jsxLoader.js

**Demo:** https://www.dataformsjs.com/examples/hello-world/pt-BR/react.htm

## Por quê :question:

O script `jsxLoader.js` foi criado para fornecer um método rápido para incluir React com JSX em página web e apps web sem processo de compilação, ferramentas CLI, ou grandes dependências necessárias; simplesmente utilize React com JSX em uma webpage ou site e inclua os CDN ou arquivos JavaScript necessários.

Ferramentas de Desenvolvimento CLI como `webpack`, `babel` e `create-react-app` são ótimas, mas elas não fazem sentido para todos os sites, páginas web e fluxos de desenvolvimento; e o `Babel Standalone` é gigante para ser incluído em cada página - 320 kB em gzipp e 1.5 MB de JavaScipt para o Navegador processar. Com opções baseadas em um navegador para JSX você pode **facilmente incluir componentes React em qualquer página** sem ter que compilar todo o site utilizando React ou JSX.

Navegadores antigos geralmente representam menos de 5 % dos usuários para a maioria dos sites - na maioria IE e versões antigas de iOS/Safari. Geralmente se alguém está navegando com o IE, eles estão acostumado a páginas lentas e se alguém estiver navegando em um iPhone ou iPad antigo eles acabam com muitos sites quebrados, então, simplesmente ter um site funcionando é bom mesmo se ele for lento. Esse script forncece um boa troca - rápido para a maioria dos usuário com navegadores modernos e continua funcionando em navegadores antigos.

Antes do `jsxLoader.js` ser criado todos os demos React no DataFormsJS utilizavam Babel Standalone. Babel Standalone é ótimo para prototipars e funciona com React DevTools, entretanto, devido ao seu tamanho ele ocupa muita memória e causa um atraso inicial ao carregar a página, então, é geralmente evitado em site em produção. Em dispositivos móveis o atraso pode ser vários segundos. Aqui está um exemplo de diferença de desempenho antes e depois utilizando `Babel` vs `jsxLoader`.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Rreact-speed-and-memory-with-babel.png" alt="React com Babel">

O desempenhoé ótimo porque o jsxLoader compila o código para JS e navegadores modernos e por ser um compilador mínimo é muito rápido para processar.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/React-speed-and-memory-with-jsxLoader.png" alt="React com jsxLoader">

## Isso pode ser utilizado em apps e sites em produção? :rocket:

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

O script `jsxLoader.js` é muito pequeno para baixar (5.2 kB - min e em gzip) e compila código muito rapidamente (geralmente em milisegundos para cada script JSX).

## Como utilizar? :star2:

```html
<!-- Inclua o React na página -->
<script src="https://unpkg.com/react@16.13.1/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@16.13.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>

<!--
    Inclua o DataFormsJS JSX Loader.
    Pode utilizar [jsxLoader.min.js] ou [jsxLoader.js].
-->
<script src="https://cdn.jsdelivr.net/npm/dataformsjs@4.0.1/js/react/jsxLoader.min.js"></script>

<!--
    Inclua componentes e scripts JSX utilizando [type="text/babel"].
    Este é o mesmo método que seria utilizado com Babel Standalone.
-->
<script type="text/babel" src="https://cdn.jsdelivr.net/npm/dataformsjs@4.0.1/js/react/es6/JsonData.js"></script>
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
```

## Demos :globe_with_meridians:

### React <img src="https://www.dataformsjs.com/img/logos/react.svg" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/pt-BR/react.htm
* https://www.dataformsjs.com/examples/places-demo-react.htm
* https://www.dataformsjs.com/examples/image-classification-react.htm
* https://www.dataformsjs.com/examples/log-table-react.htm
* https://www.dataformsjs.com/examples/countries-no-spa-react.htm
* https://www.dataformsjs.com/examples/countries-no-spa-graphql.htm
* https://www.dataformsjs.com/examples/hacker-news-react.htm

### Preact <img src="https://www.dataformsjs.com/img/logos/preact.svg" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/pt-BR/preact.htm
* https://www.dataformsjs.com/examples/countries-no-spa-preact.htm

### Rax <img src="https://www.dataformsjs.com/img/logos/rax.png" width="32" height="32">
* https://www.dataformsjs.com/examples/hello-world/pt-BR/rax.htm

## Teste-o online no Code Playground :rocket:

<a href="https://www.dataformsjs.com/pt-BR/playground">https://www.dataformsjs.com/pt-BR/playground</a>

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/Playground-React.png" alt="Code Playground do React">

## Funcionará para todos os sites e apps? :dizzy:

O script é destinado para lidar com a maioria, mas não toda sintaxse JSX. Um objetivo geral é que a maioria de JSX deve funcionar com uma trivial atualização, se necessária, em casos extremos.

Assim que essse script foi criado todas as demonstrações de React para o DataFormsJS puderam utilizá-lo ao invés do Babel sem ter que fazer qualquer mudança no código JSX e isso é o esperado para a maioria dos sites.

### Manipulando instruções de requisição e importação do node

Pelo JSX ser convertido diretamente para JS para o navegador, código que utiliza instruções `require` e `import` para o node não funcionará no navegador. Contudo, o script `jsxLoader.js` proporciona uma API flexível que pode ser utilizada para persolalizar o código gerado, para que as intruções `import` e `require` ou outro códigopossar ser manipulado pelo navegador.

Por exemplo, se você utilizar o seguinte em seu código JSX:

```js
import { useState } from 'react';
```

Então você tem duas opções:

1) Remova-o e utilize `React.useState` ao invés de `useState` em seu código. Isso funciona porque `React` é uma variável flobal para o navegador.

```javaScript
const [count, setCount] = React.useState(0);
```

2) Adicione um find e replace personalizado.

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
```

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

Isto também inclui a sintaxe de propagação JavaScriptque somente tem suporte parcial para navegadores modernos. Por exemplo `...numbers` funcionará com Chrome, Firefox, etc, mas não funcionará com todas versões do Edge ou o UC Browser que é amplamente utilizado em países Asiáticos. Se você utilizar a sintaxe the propagação em sua app, veja anotações adicionais na seção [Utilização Avançada] deste documento.

## Divisão de Código :scissors:

Um component separado DataFormsJS React `<LazyLoad>` existe e permite que apps baseadas em navegadores carreguem dinamicamente scripts `*.js`, `*.css` e `*.jsx` na primeira vez que eles são utilizados por um componenete.

Exemplo da App Demonstração Lugares:
* https://github.com/dataformsjs/dataformsjs/blob/master/examples/places-demo-react.htm
* https://github.com/dataformsjs/dataformsjs/blob/master/examples/html/search-places-react.jsx

No exemplo abaixo todos os 3 arquivos serão baixados quando o Componente `LoadMapAndPage` for montado. Enquanto os scripts estão sendo carregados, um Componenet `<ShowLoading>` será exibido e uma vez que todos downloads de scripts forem finalizados, então o Componenet `<ShowCity>` será dinamicamente criado. Neste exemplo um valor de string é utilizado por `ShowCity` porque o Componente não existirá até o arquivo `place-react.jsx` ser baixado.

Além disso as propriedades adicionadas `data` e `params` serão passadas como acessórios para `ShowCity`; quaisquer propriedades utilizadas serão passadas para o elemento filho. Se `ShowCity` já existir antes de chamar `<LazyLoad>` então `isLoaded={<isLoaded />}` poderia ser utilizada.

```jsx
function LoadMapAndPage(props) {
    return (
        <LazyLoad
            scripts={[
                'https://unpkg.com/leaflet@1.5.1/dist/leaflet.css',
                'https://unpkg.com/leaflet@1.5.1/dist/leaflet.js',
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

## Uso Avançado e Interno :microscope:

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

### Utilize Babel para Apps que incluem a Sintaxe de Propagação

Se você tiver um site que utiliza código como esse `<Greeting {...props} />`, o JSX Loader converterá-lo para `React.createElement(Greeting, ...props)` para navegadores modernos, no entanto, nem todos os navegadores modernos suportam essa sintaxe. Isto é particularmente importante se seu site é visualiza por usuários em Países Asiáticos que utilizam o UC Browser (à partir de 2020) ou visualizado por usuários que utilizam Edge (Navegador padrão no Windows 10).

Há diversas opções:

1) Evite utilizar a sintaxe de propagação
2) Utiliz o código mostrado no trecho abaixo para que Babel seja utilizado por navegadores que tem suporte à sintaxe de propagação

```js
jsxLoader.evalCode = 'const { id, ...other } = { id:123, test:456 };';
```

### Como Código JS é adicionado a página

O script `jsxLoader.js` roda no evento de Documento `DOMContentLoaded` e primeiramente verifica o ambiente para determinar se polyfills são necessários e se Babel deve ser utilizado. Ele, então, baixa o Código JSX (ou lê código JSX inline), compila-o para JavaScript normal e adiciona-o de volta à página como JavaScript no elemento `<head>`.

Scripts adicionados na página terão um atributo `data-compiler` com o valor `jsxLoader` ou `Babel` para indicar qual compilador foi adicionado. Se o script foi baixado, então, será incluído o atribuito `data-src` como a URL do script JSX original.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-added-to-page-as-js.png" alt="Código JSX compilado para JavaScript">

### Desenvolvimento Local

Tipicamente, a versão minimizada `jsxLoader.min.js` será utilizada para produção enquanto a versão completa do script `jsxLoader.js` será utilizada para desenvolvimento. Não tem dependências e é baseado em navegador, então, assim que é incluído em uma página você pode percorrer pelo código utilizando as DevTools do navegador.

### Gerando [jsxLoader.min.js] à partir do [jsxLoader.js]

Todos os arquivos `*.min.js` no DataFormsJS são gerados à partir de versões completas dos arquivos de mesmo nome utililizando um script de geração que depende de `uglify-js`, `uglify-es` e `Babel`. O `jsxLoader.min.js` pode ser gerado utilizando somente `uglify-js`.

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
# http://127.0.0.1:5000/
```

A imagem abaixo mostra como a página de Teste de Unidade é. Ao testar com um navegador moderno `jsxLoader` aparecerá no canto superior esquerdo da tela.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-testing-modern-browser.png" alt="Teste de Unit com Navegadores Modernos">

Ao testar um browser legado como o IE 11, `Babel` será mostrado juntamente com `(Polyfill Downloaded)`.

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-testing-ie-11.png" alt="Teste de Unidade com o IE 11">

Se um navegador moderno estiver sendo testado e não suportar essa sintaxe de propagação,então, um alerta útil será exibido porque isso causará falhas em alguns testes. Além disso `(Polyfill Downloaded)` aparecerá para navegadores modernos que precisam baixar Polyfills (geralmente se `Promise.prototype.finally` estiver faltando).

<img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-testing-uc-browser.png" alt="Teste de Unidade com UC Browser">

## Problemas Conhecidos :warning:

* Em geral, se um problema conhecido requer muito código, ele provavelmente não será suportado porque este script pretende ser um pequeno e rápido parser/compilador JSX e não um parser/compilador completo de JavaScript.
* Mensgens de erro podem não ser muito amigáveis para alguns erros de sintaxes inesperados, então, utilizando linting em um Editor de Código é recomendado durante o desenvolvimento para evitar erros do `jsxLoader.js`. Se você desenvolve com o Visual Studio Code ou outro editor popular, isso ocorrerá automaticamente. Se você tiver erros de sitaxe com o código gerado e não for claro porque, então, utilizar as DevTools do Chrome é recomendado (ou Edge compilado à partir do Chromium). Porque JavaScript gerado é adicionado de volta em elementos dinâmicos, a maioria dos Navegadores mostrarão a localização errado do erro, mas as versões mais recentes do Chrome e Edge mostrarão freqüentemente no local correto.
    <img src="https://raw.githubusercontent.com/dataformsjs/static-files/master/img/screenshots/jsx-debug-error-in-chrome.png" alt="Depurar Erros com as Dev Tools do Chrome">
* Loops `for` minificados podem causar problemas: `for(n=0;n<m;n++)` porque `<m;n++)` será provavelmente interpretado como um elemento. Contudo, se um arquivo completo for minificado, será processado como JavaScript, o que significa que Componentes minificados, em geral, funcionarão por padrão.
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
