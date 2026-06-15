const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'database', 'mongo');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts'));

files.forEach((file) => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Match: export const ModelName = mongoose.model<IModelName>
  // and replace with: export const ModelName = mongoose.models.ModelName || mongoose.model<IModelName>

  content = content.replace(
    /export const (\w+) = mongoose\.model</g,
    'export const $1 = mongoose.models.$1 || mongoose.model<',
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
