# 📱 React Native App com Expo & Firebase

Bem-vindo ao seu projeto **React Native** desenvolvido com **Expo** e integrado ao **Firebase**! 🚀  
Este aplicativo utiliza o **Expo Router** para navegação baseada em arquivos e o **Firebase** para autenticação e armazenamento de dados.

---

## 🧩 Tecnologias

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Firebase](https://firebase.google.com/)
- [Yarn](https://yarnpkg.com/)

---

## ⚙️ Estrutura do Projeto
```plaintext
├── app/ # Rotas e telas (Expo Router - file-based)
│ ├── +not-found.tsx # Tela padrão para rotas não encontradas (404)
│ ├── _layout.tsx # Layout raiz do app (navegação, temas globais)
│ ├── (tabs)/ # Grupo de rotas em abas (Tab Navigator)
│ │ ├── _layout.tsx # Layout das abas (configuração do Tab Navigator)
│ │ ├── index.tsx # Aba "Home" / resumo
│ │ ├── analytics.tsx # Aba "Analytics" / gráficos e métricas
│ │ ├── profile.tsx # Aba "Profile" / perfil do usuário
│ │ ├── transactions.tsx # Aba "Transactions" / listagem de transações
│ │ └── transaction-form.tsx # Aba "Transaction Form" / criar/editar transação
│ └── login/ # Fluxo de autenticação
│ ├── index.tsx # Tela de login
│ └── register.tsx # Tela de cadastro
│
├── assets/ # Recursos estáticos (imagens, fontes, animações)
│
├── components/ # Componentes reutilizáveis (comportamentais/visuais)
│ ├── ui/ # Componentes UI de baixo nível
│ │ ├── IconSymbol.tsx
│ │ ├── IconSymbol.ios.tsx
│ │ ├── Layout.tsx
│ │ ├── TabBarBackground.tsx
│ │ └── TabBarBackground.ios.tsx
│ ├── Collapsible.tsx
│ ├── ExternalLink.tsx
│ ├── HapticTab.tsx
│ ├── HelloWave.tsx
│ ├── ParallaxScrollView.tsx
│ ├── SplashScreen.tsx
│ ├── ThemedText.tsx
│ └── ThemedView.tsx
│
├── constants/
│ └── Colors.ts # Paleta de cores e tokens de tema
│
├── designSystem/ # Design System (componentes estilizados)
│ ├── Button.tsx
│ ├── Notification.tsx
│ ├── Select.tsx
│ └── UploadField.tsx
│
├── firebase/ # Integração com Firebase
│ ├── firebaseConfig.ts # Inicialização do Firebase (keys e app)
│ ├── registerFunction.ts # Serviço de cadastro/autenticação
│ └── saveTransactions.ts # Serviços de CRUD de transações
│
├── helpers/
│ └── categories.ts # Constantes/utilidades para categorias de transação
│
├── hooks/
│ ├── useColorScheme.ts # Hook para esquema de cores (native)
│ ├── useColorScheme.web.ts # Hook para esquema de cores (web)
│ └── useThemeColor.ts # Hook utilitário para tema
│
└── (outros arquivos de projeto) # package.json, tsconfig, app.json, etc.
```
---

## 🔥 Firebase

O projeto está integrado ao **Firebase**, utilizando os seguintes serviços:

### **Firestore Collections**

- **users**  
  Armazena informações básicas de cada usuário autenticado.  
  **Exemplo de documento:**
  ```json
  {
    "uid": "user_123",
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@email.com",
    "createdAt": "2025-10-07T12:00:00Z"
  }
  ```

- **transactions**  
  Registra as transações financeiras do usuário.  
  **Exemplo de documento:**
  ```json 
  {
    "categories": ["wellness"],
    "file": {
      "name": "IMG-20251007-WA0009.jpg",
      "size": 177611,
      "type": "image/jpeg",
      "uri": "file:///data/user/0/host.exp.exponent/cache/DocumentPicker/b115c891-5923-4458-be42-aca5987a7f7c.jpg"
     },
    "observation": "Academia",
    "transaction": "saída",
    "value": 150
  }
  ```

🔑 As configurações do Firebase (API key, auth domain, etc.) devem ser definidas no arquivo `firebase/firebaseConfig.ts`.

---

## 🧠 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- Node.js (versão 18+)
- Yarn
- Expo CLI

---

## 🚀 Como Rodar o Projeto

**Instale as dependências:**
```bash
yarn install
```

**Inicie o servidor de desenvolvimento utilizando tunnel:**
```bash
yarn run start:tunnel
```

Você verá um QR code no terminal. Escaneie-o com o aplicativo Expo Go no seu dispositivo Android ou iOS para abrir o app.

---

## 📚 Aprenda Mais

- [Documentação do Expo](https://docs.expo.dev/)
- [Guia do Expo Router](https://docs.expo.dev/router/introduction/)
- [Documentação do Firebase para Web](https://firebase.google.com/docs/web/setup)
- [React Native Docs](https://reactnative.dev/docs/getting-started)

---

## 💬 Comunidade

- [Expo no GitHub](https://github.com/expo/expo)
- [Discord da comunidade Expo](https://discord.gg/expo)
- [Firebase no GitHub](https://github.com/firebase/firebase-js-sdk)

---

## 🧑‍💻 Autor

```markdown
Murilo Augusto Pereira Nascimento
muriloaugusto580@gmail.com

Núbia Knupp Rodrigues Silva
nubiaknupp@gmail.com

Vivian Urnhani
vivian.ur@gmail.com

Guilherme Vinicius Sennes Domingues
guilherme.sennes@yahoo.com.br

Lais Santos da Silva
laisls722@gmail.com
```
