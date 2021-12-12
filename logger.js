const fs = require('fs').promises;

async function log(type, productId) {
   try {
      const rawData = await fs.readFile('./stats.json', 'utf-8');
      const actionList = JSON.parse(rawData);

      const action = {
         type,
         productId,
         time: (new Date()).toISOString(),
      };

      actionList.push(action);

      await fs.writeFile('./stats.json', JSON.stringify(actionList));
   } catch (err) {
      console.error('Error while logging', err);
   }
}

module.exports = log;
