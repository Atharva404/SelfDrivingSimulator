class Controls {
    constructor(type) {
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;


        switch(type) {
            case "DUMMY":
                this.forward = true;
                break;
        }
    }
}
