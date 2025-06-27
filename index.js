#!/usr/bin/env node

import inquirer from 'inquirer';
import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import figlet from 'figlet';
import ora from 'ora';

// 🎨 Logo ASCII
console.log(chalk.cyan(figlet.textSync('create-kevin-app', { horizontalLayout: 'full' })));

// 🔍 Questions personnalisées
const askProjectDetails = async () => {
  return await inquirer.prompt([
    {
      name: 'name',
      message: 'Nom du projet :',
      default: 'mon-projet-next'
    },
    {
      name: 'theme',
      message: 'Choisis un thème par défaut :',
      type: 'list',
      choices: ['clair', 'sombre'],
      default: 'clair'
    },
    {
      name: 'useAxios',
      message: 'Souhaites-tu installer Axios ?',
      type: 'confirm',
      default: true
    }
  ]);
};

// 📄 Générer un README.md personnalisé
const generateReadme = (projectName, theme, useAxios) => {
  return `# ${projectName}

🚀 Projet généré avec \`create-kevin-app\`  
🎨 Thème par défaut : **${theme}**  
🔌 Librairies : Next.js, Tailwind CSS, TypeScript${useAxios ? ', Axios' : ''}  

## 🛠️ Scripts disponibles

\`\`\`bash
npm run dev       # Lance le serveur de développement
npm run build     # Build le projet pour la production
npm run lint      # Vérifie le linting
npm run format    # Formate le code avec Prettier
\`\`\`

## ✨ Généré avec amour par Kevin ❤️
`;
};

const run = async () => {
  const { name: projectName, theme, useAxios } = await askProjectDetails();

  // 🎉 Easter egg fun
  if (projectName.toLowerCase() === 'next-fun') {
    console.log(chalk.magenta('🎉 Wow, tu as choisi un nom super fun ! Prépare-toi à un projet génial 😎'));
  }

  const spinner = ora({
    text: `Création de ${projectName}... 🚀`,
    spinner: 'dots'
  }).start();

  try {
    // Étape 1 : Créer le projet
    await execa('npx', [
      'create-next-app@latest',
      projectName,
      '--app',
      '--eslint',
      '--tailwind',
      '--ts',
      '--src-dir',
      '--import-alias',
      '@/*',
      '--turbo'
    ], { stdio: 'inherit' });

    // Étape 2 : Ajouter Prettier
    spinner.text = 'Ajout de la configuration Prettier... 🖌️';

    const prettierConfig = {
      semi: true,
      singleQuote: true,
      printWidth: 80,
      trailingComma: 'es5'
    };
    fs.writeFileSync(
      path.join(projectName, '.prettierrc'),
      JSON.stringify(prettierConfig, null, 2)
    );

    // Étape 3 : Ajouter script format dans package.json
    spinner.text = 'Ajout du script format dans package.json... 📦';
    const pkgPath = path.join(projectName, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.scripts.format = 'prettier --write .';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    // Étape 4 : Installer Axios si choisi
    if (useAxios) {
      spinner.text = 'Installation de Axios... 🔌';
      await execa('npm', ['install', 'axios'], { cwd: projectName, stdio: 'inherit' });
    }

    // Étape 5 : Générer README.md
    spinner.text = 'Génération du README.md... 📄';
    const readme = generateReadme(projectName, theme, useAxios);
    fs.writeFileSync(path.join(projectName, 'README.md'), readme);

    spinner.succeed('✅ Projet créé avec succès !');
    console.log(chalk.yellow(`\n📁 cd ${projectName}`));
    console.log(chalk.yellow(`🚀 npm run dev`));
    console.log(chalk.cyan('\n✨ Amuse-toi bien avec ton projet Next.js stylé 😎'));
  } catch (error) {
    spinner.fail(chalk.red('❌ Oups, une erreur est survenue pendant la création du projet.'));
    console.error(error);
  }
};

run();
