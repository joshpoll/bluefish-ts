# children/elements
1*null[$root.node.bottom:0]
-1*null[$root.children.elements.top:0]
+1*null[$root.children.transform.translate.y:0]
+ 5 = 0 (1001001000)

# children
1*null[$root.node.bottom:0] +
-1*null[$root.children.top:0]
+ 5 = 0 (1001001000)


=begin 
in order for these to be equal,

children/elements.top (0) - children.transform.translate.y (-27.5)
=
children.top (55)


the top expression is wrong!


children/elements.top (0) - children.transform.translate.y (-27.5) - 5
= node.bottom (22.5)


=end