#  MAMB – Museo de Arte Moderno de Barranquilla

## Arte, cultura e Inteligencia Artificial en una sola experiencia digital

> Proyecto web desarrollado para promover el arte y la cultura mediante una página web institucional y una aplicación interactiva basada en Inteligencia Artificial, inspiradas en el Museo de Arte Moderno de Barranquilla (MAMB).

---

##  Descripción del Proyecto

MAMB es una plataforma digital que integra arte, cultura e Inteligencia Artificial mediante una página web informativa y una aplicación interactiva. El proyecto busca acercar a los usuarios al mundo artístico a través de experiencias digitales innovadoras, combinando información cultural, transformación de imágenes, reconocimiento de gestos y creatividad digital.

###  Integrantes

* Laura Ortiz
* Carolina Santiago
* Joel Márquez

**Programa:** Ingeniería de Sistemas

**Universidad:** Universidad Simón Bolívar

---

##  Vista General del Proyecto

### Página Web 

<img width="1882" height="901" alt="Captura de pantalla 2026-06-04 183032" src="https://github.com/user-attachments/assets/46e3f2b0-39cc-423e-b269-c38804d20a4c" />

### Aplicación MAMB 

<img width="636" height="848" alt="image" src="https://github.com/user-attachments/assets/e5f1c9fb-ff23-463b-b6d1-7c4ce8364948" />

---

#  Tabla de Contenidos

* [Descripción General](#-descripción-general)
* [Tecnologías Utilizadas](#-tecnologías-utilizadas)
* [Estructura del Proyecto](#-estructura-del-proyecto)
* [Módulo 1: Página Web Institucional](#-módulo-1-página-web-institucional)
* [Módulo 2: Aplicación MAMBAQ-IA](#-módulo-2-aplicación-mambaq-ia)
* [Instalación y Uso](#-instalación-y-uso)
* [Base de Datos](#-base-de-datos)
* [Capturas de Pantalla](#-capturas-de-pantalla)
* [Créditos e Inspiración](#-créditos-e-inspiración)

---

#  Descripción General

El proyecto está compuesto por dos módulos complementarios:

##  Página Web 

Portal web diseñado para divulgar información relacionada con el Museo de Arte Moderno de Barranquilla, incluyendo exposiciones, eventos, historia institucional y medios de contacto.

##  Aplicación MAMB

Aplicación interactiva basada en Inteligencia Artificial que permite transformar imágenes mediante estilos artísticos, reconocer gestos de manos en tiempo real y compartir creaciones digitales en una galería virtual.

---

#  Tecnologías Utilizadas

## Frontend

* HTML5
* CSS3
* JavaScript 

## Inteligencia Artificial

* TensorFlow.js
* Google Teachable Machine

## Librerías

* html2canvas
* Lucide Icons

## Diseño Web

* CSS Grid
* Flexbox
* Diseño Responsive

---

#  Estructura del Proyecto

```text
MAMB/
│
├── PAGINA_WEB/
│   ├── html/
│   ├── css/
│   ├── js/
│   └── assets/
│
├── APLICACION/
│   ├── index.html
│   ├── styles/
│   ├── scripts/
│   ├── model/
│   └── assets/
│
└── README.md
```

---

# Módulo 1: Página Web 

La página web  permite a los usuarios explorar información cultural y artística relacionada con el museo.

## Características

### Información 

* Historia del museo.
* Información general.

### Exposiciones

* Obras destacadas.
* Galerías visuales.
* Descripción de exposiciones.

### Eventos

* Agenda cultural.
* Fechas y horarios.
* Información complementaria.

### Contacto

* Información institucional.
* Ubicación.
* Redes sociales.

### Diseño Responsivo

* Adaptación a dispositivos móviles.
* Navegación intuitiva.
* Compatibilidad multiplataforma.

---

#  Módulo 2: Aplicación MAMB

Aplicación enfocada en la interacción entre arte e Inteligencia Artificial.

## Generador de Arte con IA

Permite transformar imágenes utilizando filtros artísticos.

### Funcionalidades

* Carga de imágenes.
* Captura desde cámara web.
* Aplicación de estilos artísticos.
* Descarga de resultados.

### Estilos Disponibles

* Anime
* Cómic
* Retro
* Neón

---

## Reconocimiento de Gestos

Sistema de visión por computadora entrenado mediante Teachable Machine.

### Gestos Reconocidos

| Gesto            | Descripción            |
| ---------------- | ---------------------- |
| ✌️ Paz           | Dos dedos extendidos   |
| 🖐️ Mano abierta | Cinco dedos extendidos |
| ✊ Puño           | Mano cerrada           |

### Funcionalidades

* Detección en tiempo real.
* Clasificación de imágenes.
* Porcentaje de confianza del modelo.

---

## Galería Interactiva

* Guardar obras.
* Compartir creaciones.
* Descargar imágenes.
* Sistema de likes.

---

#  Instalación y Uso

## Clonar el repositorio

```bash
git clone https://github.com/Luciaortz/MAMB.git
```

## Página Web

```bash
cd MAMB/PAGINA_WEB
```

Abrir:

```text
index.html
```

---

## Aplicación MAMB

```bash
cd MAMB/APLICACION
```

Abrir:

```text
index.html
```

o ejecutar mediante Live Server.

---

#  Base de Datos

Actualmente ambos módulos utilizan almacenamiento local.

### Página Web

* Información estática.
* Recursos multimedia locales.

### Aplicación IA

* LocalStorage.
* Archivos JSON.
* Modelos de TensorFlow.js almacenados localmente.
* MongoDB

---

#  Capturas de Pantalla

## Página Principal del Sitio Web
<img width="1900" height="912" alt="image" src="https://github.com/user-attachments/assets/928b03fc-1e59-4d47-9003-bdf3081ab007" />


## Exposiciones

<img width="1882" height="920" alt="image" src="https://github.com/user-attachments/assets/a1e1d57d-97fc-4e16-ae81-2afe0faacf2b" />

## Eventos

<img width="1873" height="899" alt="image" src="https://github.com/user-attachments/assets/acddb430-ca67-4e75-84e9-a765a465f503" />

---

## Generador de Arte

<img width="606" height="854" alt="image" src="https://github.com/user-attachments/assets/ffa56d8a-49c4-42ae-a48c-28b9249f2d80" />
<img width="655" height="910" alt="image" src="https://github.com/user-attachments/assets/365376c8-69f1-41ba-82c3-6cbfb94fd8e3" />
<img width="616" height="884" alt="image" src="https://github.com/user-attachments/assets/14e08e24-e02b-4c49-b106-c3d17e5c949b" />

## Galería Interactiva
<img width="555" height="900" alt="image" src="https://github.com/user-attachments/assets/fb144b37-6857-46c3-884f-3e9ad18d0288" />

---

#  Créditos e Inspiración

Este proyecto fue desarrollado tomando inspiración en:

* Museo de Arte Moderno de Barranquilla (MAMB).
* Google Teachable Machine.
* TensorFlow.js.
* Museos digitales interactivos.
* Plataformas culturales digitales.
* Experiencias educativas basadas en Inteligencia Artificial.

---

<p align="center">
<strong>MAMB</strong><br>
Arte, cultura e Inteligencia Artificial para nuevas experiencias digitales.
</p>
