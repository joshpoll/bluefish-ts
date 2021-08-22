import * as courses from "./courses"
// @ponicode
describe("courses.course", () => {
    test("0", () => {
        let callFunction: any = () => {
            courses.course({ instructors: "back-end", name: "dummyName123", num: 64832 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            courses.course({ instructors: "back-end", name: "DUMMYNAME", num: 69660 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            courses.course({ instructors: "ubiquitous", name: "dummy_name/", num: 43083 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            courses.course({ instructors: "one-to-one", name: "DUMMYNAME", num: 64832 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            courses.course({ instructors: "enterprise", name: "dummyname", num: 43083 })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction: any = () => {
            courses.course({ instructors: "", name: "", num: "" })
        }
    
        expect(callFunction).not.toThrow()
    })
})
