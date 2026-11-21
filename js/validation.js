export function validated(body) {
  const output = {};
  for (const [key, min, max] of [['title',3,80],['category',2,40],['description',5,300],['status',1,40]]) {
    const value = typeof body?.[key] === 'string' ? body[key].trim() : '';
    if (value.length < min || value.length > max) throw new Error(key[0].toUpperCase()+key.slice(1)+' must have '+min+' to '+max+' characters.');
    output[key] = value;
  }
  if (!['Pending','In progress','Completed'].includes(output.status)) throw new Error('Choose Pending, In progress or Completed.');
  if (body.owner !== undefined) {
    if (typeof body.owner !== 'string' || body.owner.trim().length > 80) throw new Error('Enter an owner of up to 80 characters.');
    output.owner = body.owner.trim();
  }
  if (body.nextCheckIn !== undefined) {
    const value = body.nextCheckIn;
    if (typeof value !== 'string') throw new Error('Enter a valid check-in date and time.');
    if (value) {
      const date = new Date(value + ':00Z');
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 16) !== value) {
        throw new Error('Enter a valid check-in date and time.');
      }
    }
    output.nextCheckIn = value;
  }
  return output;
}