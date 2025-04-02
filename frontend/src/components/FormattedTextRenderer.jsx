import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkDirectiveRehype from "remark-directive-rehype";
import { remarkDefinitionList, defListHastHandlers } from "remark-definition-list";
import remarkMath from "remark-math";
import katex from "katex";

import 'katex/dist/katex.min.css';
import {memo, useMemo} from "react";

function FormattedTextRenderer({text, katexMacros}) {
  const rehypeSanitizeOptions = {
    ...defaultSchema,
    tagNames: [
      ...(defaultSchema.tagNames ?? []),
      'article',
      'aside',
      'nav',
      'section',
      'hgroup',
      'header',
      'footer',
      // ...(Object.getOwnPropertyNames(mdDirectives))
    ],
    attributes: {
      ...defaultSchema.attributes,
      '*': [
        ...(defaultSchema.attributes !== undefined
            ? (defaultSchema.attributes['*'] ?? [])
            : []),
        'className',
        'style',
      ]
    }
  }

  katexMacros = `\\newcommand{\\DeclareMathOperator}[2]{\\newcommand{#1}{\\mathop{\\mathrm{#2}}}}

\\newcommand{\\alertcolor}{\\color{#dc3545}}
\\newcommand{\\alertsymbol}[1]{{\\alertcolor\\boldsymbol{#1}}}
\\newcommand{\\alertrel}[1]{\\mathrel{\\alertcolor\\boldsymbol{#1}}}

%% General math

% Domain and range
\\DeclareMathOperator{\\dom}{dom}
\\DeclareMathOperator{\\rng}{rng}

% Powerset
\\newcommand\\powerset[1]{\\mathcal{P}(#1)}

% Cardinality
\\newcommand{\\card}[1]{\\lvert#1\\rvert}

% Numbers
\\newcommand{\\Nat}{\\mathbb{N}}

% Operations
\\newcommand{\\TIMES}{\\cdot}

% Sets
\\newcommand{\\sete}[1]{\\{#1\\}} % enumerated
\\newcommand{\\setc}[1]{\\{\\,#1\\,\\}} % comprehended


% Meta syntax %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\DeclareMathOperator{\\arity}{ar}
\\newcommand{\\Lang}{\\mathcal{L}}
\\newcommand{\\Vars}{\\mathcal{V}_{\\Lang}}
\\newcommand{\\Consts}{\\mathcal{C}_{\\Lang}}
\\newcommand{\\Preds}{\\mathcal{P}_{\\Lang}}
\\newcommand{\\Funcs}{\\mathcal{F}_{\\Lang}}
\\newcommand{\\Terms}{\\mathcal{T}_{\\Lang}}
\\newcommand{\\Atoms}{\\mathcal{A}_{\\Lang}}
\\newcommand{\\Forms}{\\mathcal{E}_{\\Lang}}
\\newcommand{\\PAtoms}{\\mathcal{PA}_{\\Lang}}
\\newcommand{\\PForms}{\\mathcal{PE}_{\\Lang}}

% Equality axioms
\\newcommand{\\Eq}{\\mathrm{Eq}}

% Syntactic transformation
\\newcommand{\\transform}{\\rightsquigarrow}

% Various syntactic functions
\\DeclareMathOperator{\\vars}{vars}
\\DeclareMathOperator{\\atoms}{atoms}
\\DeclareMathOperator{\\acnt}{acnt}
\\DeclareMathOperator{\\termVars}{termVars}
\\DeclareMathOperator{\\free}{free}
\\DeclareMathOperator{\\ground}{ground}
\\DeclareMathOperator{\\mgu}{mgu}
\\DeclareMathOperator{\\vcount}{vcount}
\\DeclareMathOperator{\\acount}{acount}
\\DeclareMathOperator{\\ccount}{ccount}
\\DeclareMathOperator{\\pcount}{pcount}
\\DeclareMathOperator{\\ncount}{ncount}
\\DeclareMathOperator{\\cjcount}{cjcount}
\\DeclareMathOperator{\\bccount}{bccount}
\\DeclareMathOperator{\\lpcount}{lpcount}
\\DeclareMathOperator{\\rpcount}{rpcount}
\\DeclareMathOperator{\\subfs}{subfs}
\\DeclareMathOperator{\\cons}{cons}
\\DeclareMathOperator{\\nnf}{nnf}


% Concrete syntax %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Connectives

\\newcommand{\\nrarr}{\\nrightarrow}
\\newcommand{\\limpl}{\\rarr}
\\newcommand{\\nlimpl}{\\nrarr}
\\newcommand{\\lequiv}{\\lrarr}
\\newcommand{\\bigland}{\\bigwedge}
\\newcommand{\\biglor}{\\bigvee}
\\newcommand{\\lnand}{\\mathbin{\\uparrow}}
\\newcommand{\\lnor}{\\mathbin{\\downarrow}}
\\newcommand{\\lxor}{\\veebar}
\\newcommand{\\landnot}{\\nrightarrow}
\\newcommand{\\emptyclause}{\\Box}
\\newcommand{\\quant}[2]{\\mathop{#1#2}\\nolimits}
\\newcommand{\\A}{\\quant\\forall}
\\newcommand{\\E}{\\quant\\exists}

% Symbols
\\newcommand{\\sym}[1]{\\text{\\textsf{#1}}}
\\newcommand{\\asym}[2]{\\text{\\textsf{#2}$^#1$}}
\\newcommand{\\var}[1]{\\text{\\textsf{\\textit{#1}}}}
\\newcommand\\vk{\\var{k}}
\\newcommand\\vl{\\var{l}}
\\newcommand\\vm{\\var{m}}
\\newcommand\\vn{\\var{n}}
\\newcommand\\vo{\\var{o}}
\\newcommand\\vp{\\var{p}}
\\newcommand\\vq{\\var{q}}
\\newcommand\\vr{\\var{r}}
\\newcommand\\vs{\\var{s}}
\\newcommand\\vt{\\var{t}}
\\newcommand\\vu{\\var{u}}
\\newcommand\\vv{\\var{v}}
\\newcommand\\vw{\\var{w}}
\\newcommand\\vx{\\var{x}}
\\newcommand\\vy{\\var{y}}
\\newcommand\\vz{\\var{z}}
\\newcommand\\sP{\\sym{P}}
\\newcommand\\sQ{\\sym{Q}}
\\newcommand\\sR{\\sym{R}}
\\newcommand\\sS{\\sym{S}}


% Semantics %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Auxiliary
\\providecommand{\\NModels}
    {\\mathrel{\\mkern1.5mu{\\not}\\nobreak\\mkern-1.5mu}\\models}
\\providecommand{\\prop}{{\\mathrm{p}}}

% General
\\providecommand{\\nmodels}{\\mathrel{\\NModels}}
\\providecommand{\\Equiv}{\\mathrel{\\Leftrightarrow}}
\\renewcommand{\\Equiv}{\\mathrel{\\Leftrightarrow}}
\\newcommand{\\alertnEquiv}{\\alertrel{\\nEquiv}}
\\newcommand{\\entails}{\\vDash}
\\newcommand{\\nentails}{\\nvDash}
\\newcommand{\\alertnentails}{\\alertrel{\\nentails}}
\\newcommand{\\proves}{\\vdash}

% Propositional
\\newcommand{\\pmodels}{\\models_\\prop}
\\newcommand{\\npmodels}{\\NModels_\\prop}
\\newcommand{\\pEquiv}{\\Equiv_\\prop}
\\newcommand{\\npEquiv}{\\nEquiv_\\prop}
\\newcommand{\\alertnpEquiv}{\\alertrel{\\npEquiv}}
\\newcommand{\\pentails}{\\entails_\\prop}
\\newcommand{\\npentails}{\\nentails_\\prop}
\\newcommand{\\alertnpentails}{\\alertrel{\\npentails}}
\\newcommand{\\pproves}{\\proves_\\prop}

% First-order
\\newcommand{\\Struct}{\\mathcal{M}}
\\newcommand{\\InStruct}{^{\\mathcal{M}}}


% Tableaux %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\newcommand{\\Tabl}{\\mathcal{T}}

\\newcommand\\sign[1]{\\mathop{\\text{\\textsf{\\textbf{#1}}}}\\nolimits}`
  const katexMacroShow = useMemo(() => {
    let m = {};
    try {
      katex.renderToString(katexMacros || '', {
        globalGroup: true,
        macros: m,
      });
    } catch (err) {
      console.log('Failed to parse global katex macros');
      m = {};
    }
    return m;
  }, [katexMacros]);

  const rehypeKatexOptions = katexMacroShow ? {
    macros: katexMacroShow
  } : undefined;

  return (
    <ReactMarkdown
      children={text}
      remarkPlugins={[
        remarkMath,
        remarkGfm,
        remarkDefinitionList,
        remarkDirective,
        remarkDirectiveRehype,
      ]}
      remarkRehypeOptions={{handlers: defListHastHandlers}}
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, rehypeSanitizeOptions],
        [rehypeKatex, rehypeKatexOptions],
      ]}
      // @ts-ignore
      // components={mdDirectives}
    />
  )
}

export default memo(FormattedTextRenderer);