#!/usr/bin/env node

import inquirer from 'inquirer';
import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import figlet from 'figlet';
import ora from 'ora';

console.log(chalk.cyan(figlet.textSync('create-kevin-app', { horizontalLayout: 'full' })));

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

  // Easter egg sympa si le nom est "next-fun"
  if (projectName.toLowerCase() === 'next-fun') {
    console.log(chalk.magenta('🎉 Wow, tu as choisi un nom super fun ! Prépare-toi à un projet génial 😎'));
  }

  const spinner = ora({
    text: 'Création du projet Next.js en cours... 🚀',
    spinner: 'dots'
  }).start();

  try {
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

    spinner.text = 'Ajout du script format dans package.json... 📦';
    const pkgPath = path.join(projectName, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.scripts.format = 'prettier --write .';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    spinner.succeed(chalk.green('✅ Projet créé avec succès !'));
    console.log(chalk.yellow(`\n👉 cd ${projectName}`));
    console.log(chalk.yellow(`👉 npm run dev`));
    console.log(chalk.cyan('\nAmuse-toi bien avec ton projet 🚀✨'));
  } catch (error) {
    spinner.fail(chalk.red('❌ Oups, une erreur est survenue pendant la création du projet.'));
    console.error(error);
  }
};

run();
