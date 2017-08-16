
class Location {
    constructor(definition) {
        this.id = definition.id;
        this.name = definition.name;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name
        };
    }
}

export default Location;