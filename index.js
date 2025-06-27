#!/usr/bin/env node

import inquirer from 'inquirer';
import {execa} from 'execa';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

console.log(chalk.blue('✨ Création de ton projet Next.js personnalisé...'));

const askProjectName = async () => {
  const { name } = await inquirer.prompt([
    {
      name: 'name',
      message: 'Nom du projet :',
      default: 'mon-projet-next'
    }
  ]);
  return name;
};

const run = async () => {
  const projectName = await askProjectName();

  // Étape 1 : Créer le projet avec la dernière version de Next.js
  await execa('npx', [
    'create-next-app@latest',
    projectName,
    '--app',
    '--eslint',
    '--tailwind',
    '--ts',
    '--src-dir',
    '--import-alias',
    '@/*'
  ], { stdio: 'inherit' });

  // Étape 2 : Ajouter la config Prettier
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
  const pkgPath = path.join(projectName, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.scripts.format = 'prettier --write .';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  console.log(chalk.green('\n✅ Projet créé avec succès !'));
  console.log(chalk.yellow(`\n👉 cd ${projectName}`));
  console.log(chalk.yellow(`👉 npm run dev`));
};

run();
