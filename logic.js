Logic = {};

Logic.Ground = function(ground, input) {
    return (1-ground)*input;
};

Logic.Transistor = function(control, input) {
    return control*input;
};

Logic.ITransistor = function(control, input) {
    return (1-control)*input;
};

Logic.NAND = function(a, b) {
    // (1-(b * (a * 1))) * 1 = (1-ba)
    //return 1 - b*a;
    return Logic.Ground(Logic.Transistor(b, Logic.Transistor(a, 1)), 1);
};

Logic.NOT = function(v) {
    // 1 - vv = { v = 1 => 1 - 1 = 0
    //          { v = 0 => 1 - 0 = 1
    //return 1-v;
    //return 1-v*v;
    return Logic.NAND(v,v);
};

Logic.BUFFER = function(v) {
    // return v;
    return Logic.NOT(Logic.NAND(v,v));
};

Logic.ONE = function(v) {
    return Logic.OR(Logic.AND(v,v), Logic.NAND(v,v));
};

Logic.ZERO = function(v) {
    return Logic.AND(Logic.AND(v,v), Logic.NAND(v,v));
};

Logic.AND = function(a, b) {
    // 1 - (1-ba)^2
    //return a*b;
    //return 1 - (1-b*a)*(1-b*a); // b*a*(2 - b*a);
    return Logic.NOT(Logic.NAND(a, b));
};

Logic.OR = function(a, b) {
    // 1 - (1-aa)(1-bb)
    //return a+b - a*b;
    //return 1 - (1-a)*(1-b);
    //return 1 - (1-a*a)*(1-b*b);
    return Logic.NAND(Logic.NAND(a,a), Logic.NAND(b,b));
};

Logic.NOR = function(a, b) {
    // 1 - (1 - (1-aa)(1-bb))^2
    //return (1-a)*(1-b);
    //return 1 - (1 - (1-a*a)*(1-b*b))*(1 - (1-a*a)*(1-b*b)); 
    //return (b*b + a*a - a*a*b*b) * (b*b + a*a - a*a*b*b);
    //return (1-a)*(1-b);
    return Logic.NOT(Logic.OR(a,b));
};

Logic.XOR = function(a, b) {
    // 1 - (1-a(1-ab))(1-b(1-ab))
    //return (1-a*b)*(a+b-a*b);
    //return 1 - (1-a*(1-a*b))*(1-b*(1-a*b));
    //return (1 - (a*b))*(1 - (1-a)*(1-b));
    return Logic.AND(Logic.NAND(a,b), Logic.OR(a,b));
};

Logic.XNOR = function(a, b) {
    return Logic.NOT(Logic.XOR(a, b));
};

Logic.ONE2 = function(a, b) {
    return Logic.OR(Logic.AND(a,b), Logic.NAND(a,b));
};

Logic.ZERO2 = function(a, b) {
    return Logic.AND(Logic.AND(a,b), Logic.NAND(a,b));
};

Logic.LEFT = function(a, b) {
    return Logic.AND(a, Logic.ONE(b, b));
};

Logic.NLEFT = function(a, b) {
    return Logic.NOT(Logic.LEFT(a, b));
};

Logic.RIGHT = function(a, b) {
    return Logic.AND(b, Logic.ONE(a, a));
};

Logic.NRIGHT = function(a, b) {
    return Logic.NOT(Logic.RIGHT(a, b));
};

Logic.XLEFT = function(a, b) {
    return Logic.AND(a, Logic.NOT(b));
};

Logic.XNLEFT = function(a, b) {
    return Logic.NOT(Logic.XLEFT(a,b));
};

Logic.XRIGHT = function(a, b) {
    return Logic.AND(b, Logic.NOT(a));
};

Logic.XNRIGHT = function(a, b) {
    return Logic.NOT(Logic.XRIGHT(a,b));
};

TestUnit = function(mixin) {
    for (var i in mixin) {
        this[i] = mixin[i];
    }
};
TestUnit.prototype = {
    run: function() {
        for (var i in this) {
            if (/^test_/.test(i)) {
                this[i]();
            }
        }
        console.log(this.name + " tests run OK");
    },

    eq: function(a, b) {
        if (a !== b) {
            throw('failure: ' + a + ' !== ' + b);
        }
    }

};


Logic.Tests = new TestUnit({
    name: "Logic",

    t2Bit: function(f, truthTable) {
        this.eq(truthTable[0], f(0,0));
        this.eq(truthTable[1], f(0,1));
        this.eq(truthTable[2], f(1,0));
        this.eq(truthTable[3], f(1,1));
    },

    t1Bit: function(f, truthTable) {
        this.eq(truthTable[0], f(0));
        this.eq(truthTable[1], f(1));
    },

    test_Transistor: function() {
        this.t2Bit(Logic.Transistor, [0, 0, 0, 1]);
    },

    test_ITransistor: function() {
        this.t2Bit(Logic.ITransistor, [0, 1, 0, 0]);
    },
    
    test_Ground: function() {
        this.t2Bit(Logic.ITransistor, [0, 1, 0, 0]);
    },

    test_Gates: function() {
        this.t1Bit(Logic.ZERO, [0, 0]);
        this.t1Bit(Logic.BUFFER, [0, 1]);
        this.t1Bit(Logic.NOT, [1, 0]);
        this.t1Bit(Logic.ONE, [1, 1]);

        this.t2Bit(Logic.ZERO2, [0, 0, 0, 0]);
        this.t2Bit(Logic.AND, [0, 0, 0, 1]);
        this.t2Bit(Logic.XLEFT, [0, 0, 1, 0]);
        this.t2Bit(Logic.LEFT, [0, 0, 1, 1]);
        this.t2Bit(Logic.XRIGHT, [0, 1, 0, 0]);
        this.t2Bit(Logic.RIGHT, [0, 1, 0, 1]);
        this.t2Bit(Logic.XOR, [0, 1, 1, 0]);
        this.t2Bit(Logic.OR, [0, 1, 1, 1]);
        this.t2Bit(Logic.NOR, [1, 0, 0, 0]);
        this.t2Bit(Logic.XNOR, [1, 0, 0, 1]);
        this.t2Bit(Logic.NRIGHT, [1, 0, 1, 0]);
        this.t2Bit(Logic.XNRIGHT, [1, 0, 1, 1]);
        this.t2Bit(Logic.NLEFT, [1, 1, 0, 0]);
        this.t2Bit(Logic.XNLEFT, [1, 1, 0, 1]);
        this.t2Bit(Logic.NAND, [1, 1, 1, 0]);
        this.t2Bit(Logic.ONE2, [1, 1, 1, 1]);
    }
});

Logic.Tests.run();


Adder = {};
Adder[1] = function(a, b) {
    var carry = [Logic.AND(a[0], b[0]), 0];
    var sum = [Logic.XOR(a[0], b[0])];
    return {carry: carry, sum: sum};
};
Adder.build2N = function(n) {
    if (n < 1) {
        return Adder[1];
    } else {
        if (!Adder[n]) {
            var halfAdder = Adder.build2N(n/2);
            Adder[n] = function(a, b) {
                var a0 = a.slice(0, n/2);
                var a1 = a.slice(n/2);
                var b0 = b.slice(0, n/2);
                var b1 = b.slice(n/2);
                var v0 = halfAdder(a0, b0);
                var v1 = halfAdder(a1, b1);
                var s1 = halfAdder(v1.sum, v0.carry);
                var carry = [Logic.OR(v1.carry[0], s1.carry[0])];
                while (carry.length < n*2) {
                    carry.push(0);
                }
                var sum = v0.sum.concat(s1.sum);
                return {sum: sum, carry: carry};
            };
        }
        return Adder[n];
    }
};

Adder.Tests = new TestUnit({
    name: "Adder",

    toInt: function(v) {
        var s = 0, i = 0;
        for (i=0; i<v.sum.length; i++) {
            s |= v.sum[i] << i;
        }
        s |= v.carry[0] << i;
        return s;
    },

    fromInt: function(num, sz) {
        var bits = [];
        for (var i=0; i<sz; i++) {
            bits.push((num >> i) & 1);
        }
        return bits;
    },

    test_adder1: function() {
        var v0 = Adder[1]([0], [0]);
        var v1 = Adder[1]([1], [0]);
        var v2 = Adder[1]([0], [1]);
        var v3 = Adder[1]([1], [1]);
        this.eq(1, v0.sum.length);
        this.eq(2, v0.carry.length);
        this.eq(0, v0.sum[0]);
        this.eq(0, v0.carry[0]);
        this.eq(0, v0.carry[1]);

        this.eq(1, v1.sum.length);
        this.eq(2, v1.carry.length);
        this.eq(1, v1.sum[0]);
        this.eq(0, v1.carry[0]);
        this.eq(0, v1.carry[1]);

        this.eq(1, v2.sum.length);
        this.eq(2, v2.carry.length);
        this.eq(1, v2.sum[0]);
        this.eq(0, v2.carry[0]);
        this.eq(0, v2.carry[1]);

        this.eq(1, v3.sum.length);
        this.eq(2, v3.carry.length);
        this.eq(0, v3.sum[0]);
        this.eq(1, v3.carry[0]);
        this.eq(0, v3.carry[1]);
    },

    testAdderN: function(n) {
        var adder = Adder.build2N(n);
        var max = (Math.pow(2, n) | 0) - 1;
        for (var i=0; i<=max; i++) {
            for (var j=0; j<=max; j++) {
                var v = adder(this.fromInt(i, n), this.fromInt(j, n));
                this.eq(i+j, this.toInt(v));
            }
        }
    },

    test_adder2N: function() {
        this.testAdderN(2);
        this.testAdderN(4);
        this.testAdderN(8);
    }

});

Adder.Tests.run();