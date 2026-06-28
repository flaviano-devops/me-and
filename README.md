# Entre Maldições

Site de perfis de personagens de Jujutsu Kaisen, construído com Next.js e preparado para publicação na Vercel.

## Tecnologias

- Next.js 16 com App Router
- React 19
- CSS responsivo
- `next/image` para otimização automática das imagens
- Geração estática das páginas dos personagens

## Desenvolvimento local

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Build de produção

```bash
npm run build
npm start
```

## Publicação na Vercel

1. Importe este repositório na Vercel.
2. A Vercel detectará o Next.js automaticamente.
3. Cadastre `NEXT_PUBLIC_SITE_URL` com o domínio definitivo do projeto.
4. Publique sem alterar o comando de build ou o diretório de saída.

## Supabase

O projeto usa Supabase para autenticação por e-mail/senha, seleção exclusiva de personagens, perfis, seguidores, Storage e chats em tempo real.

Execute, na ordem, os arquivos da pasta `supabase/migrations` no SQL Editor do Supabase. Em **Authentication → URL Configuration**, configure a URL da Vercel como Site URL. O cadastro por e-mail pode exigir confirmação conforme a opção **Confirm email** do projeto.

## Rotas

- `/` — página inicial
- `/personagens/yuji`
- `/personagens/megumi`
- `/personagens/nobara`
- `/personagens/gojo`
- `/personagens/geto`
- `/admin` — login e cadastro
- `/escolher-personagem` — seleção exclusiva
- `/chats` — salas públicas e privadas
