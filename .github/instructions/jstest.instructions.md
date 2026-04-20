---
description: this is a file that defines the instruction for JS Testing
applyTo: "*.js, *.ts"
---
We write tests for our code with Jest.
Use the following examples for positive test (test that should return true):
it('should return true if the phone number is a valid international number', () => { expect(validatePhoneNumber('+33606060606')).to.be.true; });
Organize test in logic suites and generate at least 4 positives tests and 2 negatives tests for each method.
