const fs = require("fs");
const path = require("path");
const promise = require("promise");
const { parse } = require("csv-parse");

const planets = require("./planets.mongo");

const habitablePlanets = [];

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

/*
const promise = new promise((resolve, reject) => {
    resolve(42);
});
promise.then((result) => {

});
const result = await promise;
console.log(result);
*/

function loadPlanetsData() {
  return new promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, "../../data", "kepler_data.csv"))
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          await planets.updateOne(
            {
              keplerName: data.kepler_name,
            },
            {
              keplerName: data.kepler_name,
            },
            {
              upsert: true,
            }
          );
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", () => {
        console.log(
          `A total of ${habitablePlanets.length} habitable planets found.`
        );
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({});
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
