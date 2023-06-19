/**
 * Script to update each class item's advancement when moving the linked features into a compendium or different
 * compendium. This relies on the old items still existing in their original location, as well as each item
 * having a unique name. The script will update all 'item grant' and 'item choice' type advancements. You will
 * receive a warning for each feature that was not able to be migrated.
 */

// Change these two placeholders.
const keyClasses = "key of compendium with classes";
const keyFeatures = "key of compendium with NEW features";

// Change nothing below this comment.
const classes = await game.packs.get(keyClasses).getDocuments();
for (const item of classes) {
  for (const adv of item.system.advancement) {
    const key = {ItemGrant: "items", ItemChoice: "pool"}[adv.type];
    if (!key) continue;
    await updateAdv(item, adv, key);
  }
}

async function updateAdv(item, adv, key) {
  const items = [];
  for (const oldUuid of adv.configuration[key]) {
    const newUuid = await getNewUuid(oldUuid);
    if (newUuid) items.push(newUuid);
  }
  return item.updateAdvancement(adv.id, {configuration: {[key]: items}});
}

async function getNewUuid(item, oldUuid) {
  const {name} = await fromUuid(oldUuid) ?? {};
  if (!name) {
    ui.notifications.warn(`Item '${oldUuid}' not found. Skipped and removed from class ${item.name}.`);
    return false;
  }
  const newUuid = game.packs.get(keyFeatures).index.getName(name)?.uuid;
  if (!newUuid) {
    ui.notifications.warn(`New item '${name}' not found in '${key}'. Skipped and not added to class ${item.name}.`);
    return false;
  }
  return newUuid;
}
