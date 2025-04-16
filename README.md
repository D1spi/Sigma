# **M07-UF4-PR01_INITIAL_CODE**

Aquest repositori és per codi de **backend** per a la pràctica de M07-UF4.

> [!NOTE]
> Aquesta pràctica es complementarà amb la pràctica de M06-UF3.

---

## **Instruccions generals**

1. **Revisió de la pràctica**
   El professor pot sol·licitar una entrevista o presentació de la pràctica per comprovar el correcte funcionament de l’aplicació. Només en aquest cas es podrà obtenir la nota corresponent.

2. **Entrega**
   - **Sallenet i GitHub**: Cal lliurar la pràctica dins del termini tant a Sallenet com a GitHub.
   - És imprescindible complir totes les indicacions per evitar errors d’implementació.

---

## **Enunciat**

### **Objectiu**

Desenvolupar un petit ecommerce amb funcionalitats de registre, autenticació, gestió de productes i carret de la compra.

### **Funcionalitats sol·licitades**

- **Registre d'usuari** _(0,5p)_
- **Login** _(1p)_
- **Logout** _(0,5p)_
- **Omplir la BBDD** _(1p)_
- **Buscar productes o serveis** _(1p)_
- **Veure el detall d’un producte o servei** _(1p)_
- **Afegir un producte al carret de la compra** _(1p)_
- **Veure el carret de la compra** _(0,5p)_
- **Treure un producte del carret de la compra** _(0,5p)_
  - **Implementa els tests, tant de front com de back d'aquesta funcionalitat** _(0,5p)_
- **Modificar la quantitat d’un producte del carret de la compra** _(0,5p)_
- **Seleccionar/des-seleccionar un producte del carret** _(0,5p)_
- **Confirmar la compra amb els productes seleccionats** _(0,5p)_

- **Code Quality**: _-0,25p_ per cada error de lintern.
- **Styles** _(0,5p)_
  - \*És necessari proporcionar prou codi CSS o Tailwind per avaluar els estils.
  - \*Aquesta puntuació només s'obtindrà si s'arriba a una nota de 5 a la pràctica amb les puntuacions anteriors.
- **GitHub** _(0,5p)_
  - \*Treballar amb branques (una per cada feature) i fer merge al main en acabar-les.
  - \*Es necessita un commit per classe (amb prou feina feta) i que els noms de les branques i dels commits segueixin una convenció clara i tinguin sentit.
  - \*Aquesta puntuació només s'obtindrà si s'arriba a una nota de 5 amb les puntuacions anteriors.

---

## **Arquitectura**

- **Frontend**: Utilitzar Next.js amb una divisió clara de components (arquitectura recomanada de Next.js).
- **Backend**: Utilitzar Node.js amb Express i Mongoose, seguint l’arquitectura vista a classe.

---

## **Descripció de les funcionalitats**

### **1. Registre**

#### **Front**

- Formulari amb els camps:

  - **Email**: validació de format (ha de contenir “@”).
  - **Password**: mínim 5 caràcters, amb almenys una majúscula i una minúscula.
  - **Confirmació de password**: ha de coincidir amb el camp anterior.
  - **Nom**: només pot contenir lletres.
  - **Cognoms**: només pot contenir lletres.
  - **Adreça**: sense validació específica.

- **Validacions**:
  - En temps real (cada cop que l’usuari escriu).
  - Si un camp no compleix els requisits, la vora es mostra en vermell.
  - En prémer “submit”, apareixen els missatges d’error corresponents als camps incorrectes.

#### **Back**

- Endpoint per crear nous usuaris.
- Validar els mateixos requisits que al front.

---

### **2. Login**

#### **Front**

- Formulari amb validació bàsica (Email i Password obligatoris).
- Si l’usuari no està loguejat o els tokens han caducat, qualsevol acció restringida redirigeix al formulari de login.
- Quan el backend retorni nous tokens, s’han de substituir els que estiguin caducats.

#### **Back**

- Endpoint que retorni **2 tokens**:

  - **Token d’autenticació** (expira en 5 minuts).
  - **Token de refresc** (expira en 24 hores).

- **Funcionament**:
  1. Quan el login és exitós, es retornen els dos tokens i es guarden a la BBDD dins el document de l’usuari.
  2. En cada petició (excepte registre i login), s’envien els dos tokens per header.
  3. Si el token d’autenticació és vàlid, l’endpoint es processa amb normalitat.
  4. Si el token d’autenticació no és vàlid, es comprova el token de refresc:
     - Si és vàlid, es verifica que coincideixi amb el de la BBDD:
       - Si no coincideix, es torna un error.
       - Si coincideix, es generen nous tokens (refresc i autenticació), s’actualitzen a la BBDD i es retornen al client.
     - Si el token de refresc no és vàlid, es retorna error.

---

### **3. Logout**

- **Front**: Mentre l’usuari estigui loguejat, la navbar ha de mostrar un botó de logout.
- **Back**: Endpoint per marcar els tokens (autenticació i refresc) com a “invàlids” a la BBDD (sense esborrar-los).

---

### **4. Omplir la BBDD**

#### **Back**

- Endpoint per “resetejar” la col·lecció de productes (no la d’usuaris).
- Les dades de productes s’obtenen d’una API externa (tria la que prefereixis) i se’ls assignen preus aleatoris.
- No té part de front, però s’hi accedeix mitjançant endpoint.

---

### **5. Buscar productes o serveis**

#### **Front**

- Llista de productes amb un màxim de 10 resultats.
- Formulari per cercar productes pel nom, que s’envia en prémer “submit”.
- Per cada producte, mostra una imatge, el nom i el preu.

#### **Back**

- Endpoint que retorna tots els productes que continguin el nom (rebut per paràmetre).
- Endpoint que retorna els 10 primers productes, ordenats alfabèticament.

---

### **6. Veure el detall d’un producte o servei**

#### **Front**

- Vista detallada amb:
  - Nom
  - Preu
  - Imatge
  - Descripció (o altres camps que retorni l’API externa)

> [!IMPORTANT]
> Aquest component ha de ser un Server Component de Next.js.

#### **Back**

- Endpoint per retornar tota la informació d’un producte concret.

---

### **7. Afegir un producte al carret de la compra**

#### **Front**

- A la vista de detall, botó per afegir el producte al carret.

> [!IMPORTANT]
> El carret s’ha d’emmagatzemar en un context de React i gestionar-se amb `useReducer`.

#### **Back**

- Endpoint que:
  - Crea un carret nou si l’usuari no en té cap.
  - Afegeix una unitat del producte al carret de l’usuari.

---

### **8. Veure el carret de la compra**

#### **Front**

- La navbar mostra una icona de carret si l’usuari està loguejat.
- L’icona indica el nombre total de productes al carret.
- En fer clic, s’obre una vista amb la llista de productes del carret.

#### **Back**

- Endpoint que retorna tots els productes del carret de l’usuari loguejat.

---

### **9. Treure un producte del carret de la compra**

- **Front**: Botó per eliminar un producte específic del carret.
- **Back**: Endpoint per suprimir el producte de la llista.

---

### **10. Modificar la quantitat d’un producte del carret**

#### **Front**

- Input de text per especificar la quantitat de cada producte.
- S’ha d’actualitzar el recompte de productes a la navbar quan es modifiqui la quantitat.

#### **Back**

- Endpoint per modificar la quantitat d’un producte al carret de l’usuari loguejat.

---

### **11. Seleccionar/des-seleccionar un producte del carret**

- **Front**: Checkbox o similar per marcar o desmarcar un producte.
- **Back**: Emmagatzema aquest estat amb un camp `selected: true/false` al carret.

---

### **12. Confirmar la compra**

- **Front**: Quan es confirma la compra, s’eliminen del carret els productes seleccionats i es mostra un missatge de confirmació.
- **Back**: Endpoint per processar o eliminar els productes seleccionats com a comprats.

---

## **Observacions**

- Completa les funcionalitats obligatòries per obtenir la màxima puntuació.
- Qualsevol funcionalitat extra pot millorar la percepció de la teva pràctica.
- Mantingues el codi organitzat i documentat per facilitar-ne la llegibilitat i manteniment.

> [!IMPORTANT]
> Fes servir components de servidor (Server Components) a Next.js sempre que sigui possible. I implementa, al menys un cop, el **useCallback** amb el **memo** per no rerenderitzar un component fill quan el pare es rerenderitzi.

> [!IMPORTANT]
> Utilitza middlewares al backend per reduir la repetició de codi i aplica el principi de responsabilitat única.
