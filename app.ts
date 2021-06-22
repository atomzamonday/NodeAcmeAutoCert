import {getCert} from "./cert";
(async() => {
  const cert = await getCert("chayoot789@hotmail.com",["atomza.com"])
  console.log(cert);
})();