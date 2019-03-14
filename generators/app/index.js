var Generator = require('yeoman-generator');

module.exports = class extends Generator {
    // The name `constructor` is important here
    constructor(args, opts) {
        // Calling the super constructor is important so our generator is correctly set up
        super(args, opts);

        // This makes `appname` a required argument.
        // 2 this.argument("appname", { type: String, required: true });

        // And you can then access it later; e.g.
        // 2 this.log(this.options.appname);

        // Next, add your custom code
        // 1 this.option('babel'); // This method adds support for a `--babel` flag

        //3 This method adds support for a `--coffee` flag 如命令： yo vsr --coffee=666
        // 需要先声明coffee接受的值的类型，默认是boolean类型
        this.option("coffee", {type: Number, defaults: 8000}); 

        //3 And you can then access it later; e.g.
        // this.scriptSuffix = this.options.coffee ? ".coffee" : ".js";
        this.scriptSuffix = this.options.coffee;
    }

    method1() {
        this.log('你怕不是个傻子吧，哈哈哈哈');
    }

    log(msg){
        console.log('---' + msg);
        console.log('+++++' + this.scriptSuffix)
    }
    /*
    async prompting() {
        const answers = await this.prompt([
          {
            type: "input",
            name: "name",
            message: "Your project name",
            default: this.appname // Default to current folder name
          },
          {
            type: "confirm",
            name: "cool",
            message: "Would you like to enable the Cool feature?"
          }
        ]);
    
        this.log("app name", answers.name);
        this.log("cool feature", answers.cool);
    }*/
};
