function Pomodo() {
    this.remaining = new Date(25 * 60 * 1000).getTime();
}

Pomodo.prototype.tick = function() {
    this.remaining -= 1;
    return this.remaining;
}
